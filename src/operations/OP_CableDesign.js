const { cableDesign, pdfTemplateMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { mergeTemplate, renderHtmlToPdfFile, getLogoDataUri, escapeHtml } = require("../services/pdfTemplateService");

// Puppeteer's headerTemplate/footerTemplate (unlike a <header>/<footer> flowed inside the
// page's own HTML) repeat on every printed page - exactly what a multi-page datasheet
// needs. They render in an isolated context: only inline styles are reliable, images must
// be data URIs, and the pageNumber/totalPages classes are auto-populated by Chromium.
function buildHeaderTemplate({ companyName, companyAddr, logoDataUri, cableType, generatedDate }) {
    return `
    <div style="width:100%; font-family: Helvetica, Arial, sans-serif; font-size:8px; color:#111827; padding:0 13mm; box-sizing:border-box; display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #16224A;">
      <div style="display:flex; align-items:center; gap:8px;">
        ${logoDataUri ? `<img src="${logoDataUri}" style="width:24px;height:24px;object-fit:contain;">` : ""}
        <div>
          <div style="font-size:10px; font-weight:700; color:#16224A;">${escapeHtml(companyName)}</div>
          <div style="font-size:7px; color:#64748B;">${escapeHtml(companyAddr)}</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:7px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#E0A82E;">Cable Design Datasheet</div>
        <div style="font-size:9px; font-weight:600; color:#16224A;">${escapeHtml(cableType)} &middot; ${escapeHtml(generatedDate)}</div>
      </div>
    </div>`;
}

function buildFooterTemplate({ companyName, regdOfficeLine, regdContactLine, cableType, generatedDate }) {
    return `
    <div style="width:100%; font-family: Helvetica, Arial, sans-serif; font-size:6.5px; color:#94A3B8; padding:4px 13mm 0; box-sizing:border-box; display:flex; justify-content:space-between; border-top:1px solid #E4E9F0;">
      <div>
        <div style="font-weight:600; color:#64748B;">${escapeHtml(companyName)}</div>
        <div>${escapeHtml(regdOfficeLine)}</div>
        <div>${escapeHtml(regdContactLine)}</div>
      </div>
      <div style="text-align:right;">
        <div>Cable Type: ${escapeHtml(cableType)} &middot; Generated ${escapeHtml(generatedDate)}</div>
        <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
      </div>
    </div>`;
}

exports.addData = async function (body) {
    const t = await sequelize.transaction();
    try {
        const result = await cableDesign.create(body.data, { transaction: t });
        await t.commit();
        responseCodes.SUCCESS.data = result.id;
        responseCodes.SUCCESS.message = "Design Saved Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        await t.rollback();
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Save Design";
        return responseCodes.BAD_REQUEST;
    }
};

exports.updateData = async function (body) {
    const t = await sequelize.transaction();
    try {
        await cableDesign.update(body.data, { where: { id: body.id }, transaction: t });
        await t.commit();
        responseCodes.SUCCESS.data = null;
        responseCodes.SUCCESS.message = "Design Updated Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        await t.rollback();
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Update Design";
        return responseCodes.BAD_REQUEST;
    }
};

exports.deleteData = async function (body) {
    const t = await sequelize.transaction();
    try {
        await cableDesign.update(body.data, { where: { id: body.id }, transaction: t });
        await t.commit();
        responseCodes.SUCCESS.data = null;
        responseCodes.SUCCESS.message = "Design Deleted Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        await t.rollback();
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Delete Design";
        return responseCodes.BAD_REQUEST;
    }
};

exports.getAllData = async function () {
    try {
        const query = `
            SELECT cd.*, CONCAT(um.first_name, ' ', um.last_name) AS created_by_name
            FROM cable_design cd
            LEFT JOIN users_master um ON um.id = cd.created_by
            WHERE cd.status = 1
            ORDER BY cd.id DESC`;
        const data = await sequelize.query(query, { type: QueryTypes.SELECT });
        responseCodes.SUCCESS.data = data;
        responseCodes.SUCCESS.message = "";
        return responseCodes.SUCCESS;
    } catch (e) {
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Load Designs";
        return responseCodes.BAD_REQUEST;
    }
};

exports.getOneData = async function (id) {
    try {
        const data = await cableDesign.findOne({ where: { id, status: 1 } });
        if (data) {
            responseCodes.SUCCESS.data = data;
            responseCodes.SUCCESS.message = "";
            return responseCodes.SUCCESS;
        } else {
            responseCodes.NOT_FOUND.data = null;
            responseCodes.NOT_FOUND.message = "No Record Found";
            return responseCodes.NOT_FOUND;
        }
    } catch (e) {
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Load Design";
        return responseCodes.BAD_REQUEST;
    }
};

// Renders a saved design through a PDF Template Master template (template_type =
// 'cable_design') via Puppeteer - same pattern as the Salary Slip PDF (see
// OP_salaryPayment.generateSlip). A design that's already been generated before keeps
// using the exact template version it was first generated with, so editing/replacing
// the default template afterwards can't retroactively change an already-issued PDF.
exports.generatePdf = async function (id) {
    const t = await sequelize.transaction();
    try {
        const design = await cableDesign.findOne({ where: { id, status: 1 }, transaction: t });
        if (!design) {
            await t.rollback();
            responseCodes.NOT_FOUND.data = null;
            responseCodes.NOT_FOUND.message = "Cable design not found";
            return responseCodes.NOT_FOUND;
        }

        let template = null;
        if (design.pdf_template_id) {
            template = await pdfTemplateMaster.findOne({ where: { id: design.pdf_template_id }, transaction: t });
        }
        if (!template) {
            template = await pdfTemplateMaster.findOne({
                where: { template_type: "cable_design", is_default: true, is_active: 1 },
                transaction: t,
            });
        }
        if (!template) {
            await t.rollback();
            responseCodes.BAD_REQUEST.data = null;
            responseCodes.BAD_REQUEST.message = "No active PDF template configured for Cable Design — set one up in PDF Template Master.";
            return responseCodes.BAD_REQUEST;
        }

        // Company/registered-office branding - same source tables and shape as the
        // Salary Slip PDF header/footer (see OP_salaryPayment.generateSlip).
        const brandingRows = await sequelize.query(
            `SELECT cbm.client_name AS company_name,
                    cbm.client_logo AS company_logo,
                    olm.full_address AS company_address,
                    city.name        AS company_city,
                    state.name       AS company_state,
                    olm.pincode      AS company_pincode,
                    rolm.full_address AS regd_office_address,
                    rolm.city         AS regd_office_city,
                    rolm.state        AS regd_office_state,
                    rolm.pincode      AS regd_office_pincode,
                    rolm.phone        AS regd_office_phone,
                    rolm.email        AS regd_office_email
             FROM client_branding_master cbm
             LEFT JOIN office_location_master olm ON olm.id = 1
             LEFT JOIN city_master  city  ON city.id  = olm.city_id
             LEFT JOIN state_master state ON state.id = olm.state_id
             LEFT JOIN LATERAL (
               SELECT r.full_address, r.phone, r.email, r.pincode,
                      rc.name AS city, rs.name AS state
               FROM office_location_master r
               LEFT JOIN city_master  rc ON rc.id = r.city_id
               LEFT JOIN state_master rs ON rs.id = r.state_id
               WHERE r.is_registered_office = true AND r.status = 1
               LIMIT 1
             ) rolm ON true
             WHERE cbm.id = 1
             LIMIT 1`,
            { transaction: t, type: QueryTypes.SELECT }
        );
        const branding = brandingRows[0] || {};

        const cityStatePin = [branding.company_city, branding.company_state].filter(Boolean).join(", ")
            + (branding.company_pincode ? ` - ${branding.company_pincode}` : "");
        const regdCityStatePin = [branding.regd_office_city, branding.regd_office_state].filter(Boolean).join(", ")
            + (branding.regd_office_pincode ? ` - ${branding.regd_office_pincode}` : "");
        const regdOfficeLine = branding.regd_office_address
            ? `Regd. Office: ${branding.regd_office_address}` + (regdCityStatePin ? `, ${regdCityStatePin}` : "")
            : "";
        const regdContactLine = [
            branding.regd_office_phone ? `Phone: ${branding.regd_office_phone}` : null,
            branding.regd_office_email ? `Email: ${branding.regd_office_email}` : null,
        ].filter(Boolean).join("   |   ");

        const mergeData = {
            company_name: branding.company_name || "ADVANCE CABLE TECHNOLOGIES LIMITED",
            company_logo_data_uri: getLogoDataUri(branding.company_logo),
            company_address: branding.company_address || "",
            company_city_state_pin: cityStatePin,
            regd_office_line: regdOfficeLine,
            regd_contact_line: regdContactLine,

            cable_type: design.cable_type,
            conductor_size: design.conductor_size,
            no_of_cores: design.no_of_cores,
            conductor_material: design.conductor_material,
            insulation_material: design.insulation_material,
            outer_sheath_material: design.outer_sheath_material || "",
            inner_sheath_material: design.inner_sheath_material || "",
            created_date_formatted: design.created_date ? new Date(design.created_date).toLocaleDateString("en-IN") : "",
            ...design.construction_values,
        };

        const designsDir = path.join(__dirname, "..", "public", "cable-designs");
        if (!fs.existsSync(designsDir)) fs.mkdirSync(designsDir, { recursive: true });

        const fileName = `design_${id}.pdf`;
        const filePath = path.join(designsDir, fileName);
        const pdfUrl = `/cable-designs/${fileName}`;

        const mergedHtml = mergeTemplate(template.html_content, mergeData);

        const headerTemplate = buildHeaderTemplate({
            companyName: mergeData.company_name,
            companyAddr: [mergeData.company_address, mergeData.company_city_state_pin].filter(Boolean).join(", "),
            logoDataUri: mergeData.company_logo_data_uri,
            cableType: mergeData.cable_type,
            generatedDate: mergeData.created_date_formatted,
        });
        const footerTemplate = buildFooterTemplate({
            companyName: mergeData.company_name,
            regdOfficeLine: mergeData.regd_office_line,
            regdContactLine: mergeData.regd_contact_line,
            cableType: mergeData.cable_type,
            generatedDate: mergeData.created_date_formatted,
        });

        await renderHtmlToPdfFile(mergedHtml, filePath, {
            displayHeaderFooter: true,
            headerTemplate,
            footerTemplate,
            margin: { top: "26mm", bottom: "18mm", left: "13mm", right: "13mm" },
        });

        await cableDesign.update({ pdf_url: pdfUrl, pdf_template_id: template.id }, { where: { id }, transaction: t });
        await t.commit();

        responseCodes.SUCCESS.data = { pdf_url: pdfUrl };
        responseCodes.SUCCESS.message = "PDF generated successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        await t.rollback();
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to generate PDF";
        return responseCodes.BAD_REQUEST;
    }
};
