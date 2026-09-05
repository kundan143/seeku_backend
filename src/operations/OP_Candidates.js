const { candidates, candidateOfferHistory, usersMaster, usersSalaryDetails } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const transporter = require("../services/mailTransporterService");

const saltRounds = 10;

const ALLOWED_STATUSES = ["draft", "sent", "accepted", "rejected", "withdrawn", "converted"];

// Computed server-side (never trusted from the client) so it can't drift from offer_date/
// offer_validity_days - returned as a plain YYYY-MM-DD string, matching DATEONLY's own format.
function computeOfferExpiryDate(offerDate, validityDays) {
  if (!offerDate || !validityDays) return null;
  const d = new Date(offerDate);
  d.setDate(d.getDate() + Number(validityDays));
  return d.toISOString().slice(0, 10);
}

exports.addData = async function (body) {
  try {
    body.data.offer_expiry_date = computeOfferExpiryDate(body.data.offer_date, body.data.offer_validity_days);
    const result = await candidates.create(body.data);
    responseCodes.SUCCESS.data = result.id;
    responseCodes.SUCCESS.message = "Candidate Added Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Candidate";
    return responseCodes.BAD_REQUEST;
  }
};

// Archives whatever Offer Letter PDF is currently live for this candidate to a timestamped
// filename before an edit overwrites the candidate row (and, later, before regeneration would
// overwrite the PDF itself at its fixed offer_<id>.pdf path) - returns the archived file's URL,
// or null if no letter had been generated yet.
function archiveCurrentOfferLetter(candidateId, currentLetterUrl) {
  if (!currentLetterUrl) return null;
  const lettersDir = path.join(__dirname, "..", "public", "offer-letters");
  const currentPath = path.join(__dirname, "..", "public", currentLetterUrl.replace(/^\//, ""));
  if (!fs.existsSync(currentPath)) return null;
  const archivedFileName = `offer_${candidateId}_history_${Date.now()}.pdf`;
  fs.copyFileSync(currentPath, path.join(lettersDir, archivedFileName));
  return `/offer-letters/${archivedFileName}`;
}

exports.updateData = async function (body) {
  const t = await sequelize.transaction();
  try {
    const before = await candidates.findByPk(body.id, { transaction: t });
    // Never trust the client's UI state for this - re-checked server-side too, same as the
    // Edit/Generate PDF icons being hidden once a candidate is converted to an employee.
    if (before && before.get("offer_status") === "converted") {
      await t.rollback();
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "This candidate has already been converted to an employee and can no longer be edited";
      return responseCodes.BAD_REQUEST;
    }
    if (before) {
      const beforePlain = before.get({ plain: true });
      await candidateOfferHistory.create(
        {
          candidate_id: body.id,
          old_snapshot: beforePlain,
          new_snapshot: body.data,
          old_letter_url: archiveCurrentOfferLetter(body.id, beforePlain.offer_letter_url),
          modified_by: body.data.modified_by,
          modified_date: body.data.modified_date,
        },
        { transaction: t }
      );
    }

    body.data.offer_expiry_date = computeOfferExpiryDate(body.data.offer_date, body.data.offer_validity_days);
    await candidates.update(body.data, { where: { id: body.id }, transaction: t });
    await t.commit();
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Candidate Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Candidate";
    return responseCodes.BAD_REQUEST;
  }
};

const DELETE_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours

exports.deleteData = async function (body) {
  try {
    const candidate = await candidates.findByPk(body.id);
    if (!candidate) {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Candidate record not found";
      return responseCodes.NOT_FOUND;
    }
    // Never trust the client's clock/state for this - re-checked server-side against the
    // record's own created_date every time, same as any other authorization-style guard.
    const createdDate = candidate.get("created_date");
    if (createdDate && Date.now() - new Date(createdDate).getTime() > DELETE_WINDOW_MS) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "This candidate can no longer be deleted - more than 2 hours have passed since it was added";
      return responseCodes.BAD_REQUEST;
    }

    await candidates.update(
      { status: 0, deleted_by: body.deleted_by, deleted_date: body.deleted_date },
      { where: { id: body.id } }
    );
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Candidate Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Candidate";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function () {
  try {
    // Auto-expire: a draft/sent offer whose validity window has passed flips to 'expired' the
    // next time this list loads - no separate cron job needed.
    await sequelize.query(
      `UPDATE candidates
       SET offer_status = 'expired'
       WHERE status = 1 AND offer_status IN ('draft', 'sent')
         AND offer_expiry_date IS NOT NULL AND offer_expiry_date < CURRENT_DATE`
    );
    const query = `
      SELECT c.*,
             CONCAT(c.first_name, ' ', c.last_name) AS candidate_name,
             dm.name  AS department_name,
             dm2.designation AS designation_name
      FROM candidates c
      LEFT JOIN department_master  dm  ON dm.id  = c.department_id
      LEFT JOIN designation_master dm2 ON dm2.id = c.designation_id
      WHERE c.status = 1
      ORDER BY c.id DESC`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Candidates";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getOfferHistory = async function (candidate_id) {
  try {
    const query = `
      SELECT coh.*,
             CONCAT(um.first_name, ' ', um.middle_name, ' ', um.last_name) AS modified_by_name
      FROM candidate_offer_history coh
      LEFT JOIN users_master um ON um.id = coh.modified_by
      WHERE coh.candidate_id = :candidate_id
      ORDER BY coh.id DESC`;
    const data = await sequelize.query(query, {
      replacements: { candidate_id },
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Offer History";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getOneData = async function (id) {
  try {
    const query = `
      SELECT c.*,
             CONCAT(c.first_name, ' ', c.last_name) AS candidate_name,
             dm.name  AS department_name,
             dm2.designation AS designation_name,
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS reporting_manager_name
      FROM candidates c
      LEFT JOIN department_master  dm  ON dm.id  = c.department_id
      LEFT JOIN designation_master dm2 ON dm2.id = c.designation_id
      LEFT JOIN users_master       um  ON um.id  = c.reporting_manager_id
      WHERE c.id = :id AND c.status = 1
      LIMIT 1`;
    const data = await sequelize.query(query, { replacements: { id }, type: QueryTypes.SELECT });
    if (data.length) {
      responseCodes.SUCCESS.data = data[0];
      responseCodes.SUCCESS.message = "";
      return responseCodes.SUCCESS;
    }
    responseCodes.NOT_FOUND.data = null;
    responseCodes.NOT_FOUND.message = "No Record Found";
    return responseCodes.NOT_FOUND;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Candidate";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateStatus = async function (body) {
  try {
    if (!ALLOWED_STATUSES.includes(body.offer_status)) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}`;
      return responseCodes.BAD_REQUEST;
    }
    const [affected] = await candidates.update(
      { offer_status: body.offer_status, modified_by: body.modified_by, modified_date: body.modified_date },
      { where: { id: body.id, status: 1 } }
    );
    if (!affected) {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Candidate not found";
      return responseCodes.NOT_FOUND;
    }
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = `Candidate marked as ${body.offer_status}`;
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Candidate Status";
    return responseCodes.BAD_REQUEST;
  }
};

// Called once the employee that started life as this candidate has actually been saved via
// Employee Master's Add Profile form (see edit-profile.component.ts) - links the two records and
// flips offer_status to 'converted' only now, since before this point no employee existed yet.
exports.linkConvertedEmployee = async function (body) {
  try {
    const [affected] = await candidates.update(
      {
        offer_status: "converted",
        converted_user_id: body.converted_user_id,
        modified_by: body.modified_by,
        modified_date: body.modified_date,
      },
      { where: { id: body.candidate_id, status: 1 } }
    );
    if (!affected) {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Candidate not found";
      return responseCodes.NOT_FOUND;
    }
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Candidate marked as converted";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to link converted employee to candidate";
    return responseCodes.BAD_REQUEST;
  }
};

async function fetchCandidateForLetter(id) {
  const query = `
    SELECT c.*,
           CONCAT(c.first_name, ' ', c.last_name) AS candidate_name,
           dm.name  AS department_name,
           dm2.designation AS designation_name,
           CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS reporting_manager_name,
           cbm.client_name AS company_name,
           cbm.client_logo AS company_logo,
           olm.full_address AS company_address,
           city.name        AS company_city,
           state.name       AS company_state,
           olm.pincode      AS company_pincode
    FROM candidates c
    LEFT JOIN department_master  dm  ON dm.id  = c.department_id
    LEFT JOIN designation_master dm2 ON dm2.id = c.designation_id
    LEFT JOIN users_master       um  ON um.id  = c.reporting_manager_id
    LEFT JOIN client_branding_master cbm ON cbm.id = 1
    LEFT JOIN office_location_master olm ON olm.id = 1
    LEFT JOIN city_master  city ON city.id  = olm.city_id
    LEFT JOIN state_master state ON state.id = olm.state_id
    WHERE c.id = :id AND c.status = 1
    LIMIT 1`;
  const rows = await sequelize.query(query, { replacements: { id }, type: QueryTypes.SELECT });
  return rows[0] || null;
}

exports.generateOfferLetter = async function (id) {
  try {
    const c = await fetchCandidateForLetter(id);
    if (!c) {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Candidate record not found";
      return responseCodes.NOT_FOUND;
    }
    // Never trust the client's UI state for this - re-checked server-side too, same as the
    // Edit/Generate PDF icons being hidden once a candidate is converted to an employee.
    if (c.offer_status === "converted") {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "This candidate has already been converted to an employee and the offer letter can no longer be regenerated";
      return responseCodes.BAD_REQUEST;
    }

    const lettersDir = path.join(__dirname, "..", "public", "offer-letters");
    if (!fs.existsSync(lettersDir)) fs.mkdirSync(lettersDir, { recursive: true });

    const fileName = `offer_${id}.pdf`;
    const filePath = path.join(lettersDir, fileName);
    const letterUrl = `/offer-letters/${fileName}`;

    const fmt = (n) => (parseFloat(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—");

    await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const W = doc.page.width - 80;
      const L = 40;

      // ── Header (logo left, company name + address centered - same source as the Salary
      // Slip: client_branding_master/office_location_master, joined in fetchCandidateForLetter) ──
      const headerY = 30;
      if (c.company_logo) {
        const logoPath = path.join(__dirname, "..", "public", c.company_logo.replace(/^\//, ""));
        if (fs.existsSync(logoPath)) {
          try {
            doc.image(logoPath, L, headerY, { height: 32 });
          } catch (e) {
            // Unsupported/corrupt logo file - fall back to text-only header.
          }
        }
      }
      doc.fontSize(18).font("Helvetica-Bold").fillColor("#1a3c5e")
         .text((c.company_name || "ADVANCE CABLE TECHNOLOGIES LIMITED").toUpperCase(), L, headerY + 4, { align: "center", width: W });
      doc.fontSize(10).font("Helvetica").fillColor("#555555")
         .text("Offer Letter", L, doc.y + 2, { align: "center", width: W });
      const cityStatePin = [c.company_city, c.company_state].filter(Boolean).join(", ")
        + (c.company_pincode ? ` - ${c.company_pincode}` : "");
      const companyAddressLine = [c.company_address, cityStatePin].filter(Boolean).join(", ");
      if (companyAddressLine) {
        doc.fontSize(8).font("Helvetica").fillColor("#777777")
           .text(companyAddressLine, L, doc.y + 2, { align: "center", width: W });
      }
      doc.moveTo(L, doc.y + 8).lineTo(L + W, doc.y + 8).strokeColor("#1a3c5e").lineWidth(1.5).stroke();

      // ── Date + Candidate address ─────────────────────────────
      // Every .text(str, x, y) call below already advances doc.y past the printed line on its
      // own - each subsequent call just reads doc.y fresh instead of adding its own offset on
      // top, so gaps don't compound into extra whitespace.
      doc.y += 16;
      doc.fontSize(9).font("Helvetica").fillColor("#333333")
         .text(`Date: ${fmtDate(c.offer_date)}`, L, doc.y);
      if (c.offer_expiry_date) {
        doc.fillColor("#a32d2d")
           .text(`This offer is valid until ${fmtDate(c.offer_expiry_date)}.`, L, doc.y);
        doc.fillColor("#333333");
      }
      doc.y += 8;
      doc.font("Helvetica-Bold").text(c.candidate_name, L, doc.y);
      doc.font("Helvetica").text(c.email, L, doc.y);
      doc.text(c.mobile, L, doc.y);
      doc.y += 16;

      // ── Salutation + body ─────────────────────────────────────
      doc.font("Helvetica-Bold").fontSize(10).text(`Dear ${c.first_name},`, L, doc.y);
      doc.y += 8;
      doc.font("Helvetica").fontSize(9.5).fillColor("#111111").text(
        `We are pleased to offer you the position of ${c.designation_name || "—"} in the ${c.department_name || "—"} department at Advance Cable Technologies Limited. Your proposed date of joining is ${fmtDate(c.doj)}. This letter sets out the key terms of employment being offered to you.`,
        L, doc.y, { width: W, align: "justify" }
      );
      doc.y += 8;

      // ── CTC highlight ──────────────────────────────────────────
      doc.y += 8;
      const ctcY = doc.y;
      doc.roundedRect(L, ctcY, W, 40, 4).fillAndStroke("#1a7a4c", "#1a7a4c");
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff").text("TOTAL COST TO COMPANY (Annual)", L + 12, ctcY + 8);
      doc.font("Helvetica-Bold").fontSize(15).fillColor("#ffffff").text(fmt(c.ctc), L + 12, ctcY + 20);
      doc.y = ctcY + 52;

      // ── Salary breakup (single table: Component | Monthly | Annual) ─
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#1a3c5e").text("Salary Breakup", L, doc.y);
      doc.y += 8;

      const tableTop = doc.y;
      const componentW = W * 0.5, monthlyW = W * 0.25, annualW = W * 0.25;
      const monthlyColX = L + componentW, annualColX = L + componentW + monthlyW;

      // Deductions (PF/PT/TDS/ESI/Loan) aren't collected at offer stage - they're finalized later
      // in Employee Salary Master once the candidate is actually hired - so every row here is an
      // Earning: its recurring monthly value in the Monthly column, the same component annualized
      // (x12) in the Annual column. Every Variable Pay - regardless of its own Monthly/Yearly/
      // Half-Yearly frequency - only ever appears in the Annual column, at its true annual value
      // (a Yearly/Half-Yearly one already stores that annual total; a Monthly one is x12 here) -
      // its Monthly cell is left blank. A row is printed only when either column is > 0.
      const MONTHLY_FIELDS = [
        ["Basic + DA",         (Number(c.basic_salary) || 0) + (Number(c.dearness_allowance) || 0)],
        ["City Allowance",     c.city_allowance],
        ["HRA",                c.hra],
        ["Conveyance",         c.conveyance],
        ["Medical Allowance",  c.medical_allowance],
        ["LTA",                c.lta],
        ["Special Allowance",  c.special_allowance],
        ["Exgratia(As Per Company Policy)",           c.bonus],
        ["Fuel/Transport Expenses", c.fuel_transport_expenses],
        ["Medical Insurance",       c.medical_insurance],
        ["Accidental Insurance",    c.accidental_insurance],
        ["Uniform",                 c.uniform],
        ["PF",           c.pf_employer],
        ["Gratuity",     c.gratuity],
      ];

      const variablePayRow = (n) => {
        const amount = Number(c[`variable_pay_${n}`]) || 0;
        const frequency = c[`variable_pay_${n}_frequency`] || "Monthly";
        const yearly = frequency === "Monthly" ? amount * 12 : amount;
        return [`Variable Pay ${n} (${frequency})`, null, yearly];
      };

      const breakupRows = [
        ...MONTHLY_FIELDS.map(([label, val]) => {
          const monthly = Number(val) || 0;
          return [label, monthly, monthly * 12];
        }),
        variablePayRow(1),
        variablePayRow(2),
        variablePayRow(3),
        variablePayRow(4),
      ].filter(([, monthly, annual]) => (Number(monthly) || 0) > 0 || (Number(annual) || 0) > 0);

      doc.rect(L, tableTop, W, 20).fill("#1a3c5e");
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff").text("COMPONENT", L + 6, tableTop + 6, { width: componentW - 6 });
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff").text("MONTHLY(Rs.)", monthlyColX, tableTop + 6, { width: monthlyW - 6, align: "right" });
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff").text("ANNUAL(Rs.)", annualColX, tableTop + 6, { width: annualW - 6, align: "right" });

      let ty = tableTop + 20;
      breakupRows.forEach(([label, monthly, annual], idx) => {
        const rowBg = idx % 2 === 0 ? "#f9fafb" : "#ffffff";
        doc.rect(L, ty, W, 16).fill(rowBg);
        doc.font("Helvetica").fontSize(8).fillColor("#333333").text(label, L + 6, ty + 4, { width: componentW - 6 });
        doc.font("Helvetica").fontSize(8).fillColor("#111111")
          .text(monthly != null && monthly > 0 ? fmt(monthly) : "—", monthlyColX, ty + 4, { width: monthlyW - 6, align: "right" });
        doc.font("Helvetica").fontSize(8).fillColor("#111111").text(fmt(annual), annualColX, ty + 4, { width: annualW - 6, align: "right" });
        ty += 16;
      });
      doc.rect(L, tableTop, W, ty - tableTop).strokeColor("#d0dce8").lineWidth(0.5).stroke();
      doc.moveTo(monthlyColX, tableTop).lineTo(monthlyColX, ty).strokeColor("#d0dce8").lineWidth(0.5).stroke();
      doc.moveTo(annualColX, tableTop).lineTo(annualColX, ty).strokeColor("#d0dce8").lineWidth(0.5).stroke();
      // Gross/Net Salary summary boxes intentionally omitted - Total Cost To Company (above) is
      // the only cost figure this letter surfaces.
      doc.y = ty + 10;

      // ── Terms & Conditions ───────────────────────────────────
      if (doc.y > doc.page.height - 220) doc.addPage();
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#1a3c5e").text("Terms & Conditions", L, doc.y);
      doc.y += 10;

      const standardTerms = [
        "This offer is contingent upon successful completion of background verification and submission of required documents.",
        "You will be on probation for a period of 6 months from your date of joining, extendable at the company's discretion.",
        "During and after probation, employment may be terminated by either party by giving 30 days' written notice.",
        "You will be governed by the company's HR policies, code of conduct, and confidentiality obligations as amended from time to time.",
        "This offer is valid until the date of joining mentioned above and stands withdrawn if not accepted before that date.",
      ];
      if (c.terms) standardTerms.push(c.terms);

      doc.font("Helvetica").fontSize(8.5).fillColor("#333333");
      standardTerms.forEach((t) => {
        doc.text(`•  ${t}`, L, doc.y, { width: W, align: "justify" });
        doc.y += 4;
      });

      doc.y += 10;
      doc.font("Helvetica").fontSize(9).fillColor("#111111").text(
        "We look forward to having you onboard. Please sign and return a copy of this letter as a token of your acceptance of the above terms.",
        L, doc.y, { width: W, align: "justify" }
      );

      // ── Signatures ───────────────────────────────────────────
      doc.y += 40;
      if (doc.y > doc.page.height - 80) doc.addPage();
      const sigY = doc.y;
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#111111").text("For Advance Cable Technologies Limited", L, sigY);
      doc.font("Helvetica-Bold").fontSize(9).text("Candidate Acceptance", L + W / 2, sigY);
      doc.font("Helvetica").fontSize(8.5).fillColor("#555555")
         .text("Authorised Signatory", L, sigY + 30)
         .text("Signature & Date", L + W / 2, sigY + 30);

      doc.end();
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    await candidates.update({ offer_letter_url: letterUrl }, { where: { id } });

    responseCodes.SUCCESS.data = { offer_letter_url: letterUrl };
    responseCodes.SUCCESS.message = "Offer letter generated successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to generate offer letter";
    return responseCodes.BAD_REQUEST;
  }
};

exports.emailOfferLetter = async function (id, toEmail) {
  try {
    const c = await fetchCandidateForLetter(id);
    if (!c) {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Candidate record not found";
      return responseCodes.NOT_FOUND;
    }

    const recipient = Array.isArray(toEmail) ? toEmail.join(", ") : (toEmail || c.email);
    if (!recipient) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "No email address found for this candidate";
      return responseCodes.BAD_REQUEST;
    }

    let letterUrl = c.offer_letter_url;
    const filePath = letterUrl ? path.join(__dirname, "..", "public", letterUrl) : null;
    if (!letterUrl || !fs.existsSync(filePath)) {
      const generated = await exports.generateOfferLetter(id);
      if (generated.code !== "100") return generated;
      letterUrl = generated.data.offer_letter_url;
    }

    const subject = `Offer Letter — ${c.designation_name || "Position"} at Advance Cable Technologies Limited`;
    const html = `
      <p>Dear ${c.first_name},</p>
      <p>Please find attached your offer letter for the position of <strong>${c.designation_name || "—"}</strong> in the <strong>${c.department_name || "—"}</strong> department.</p>
      <p>Kindly review the attached letter and revert with your acceptance.</p>
      <br/>
      <p style="color:#999;font-size:11px;">This is a system-generated email. Please do not reply.</p>
    `;

    await transporter.sendMail({
      from: process.env.EXP_HANDLE_USER_NAME || "no-reply@seeku.in",
      to: recipient,
      subject,
      html,
      attachments: [
        {
          filename: `Offer_Letter_${[c.first_name, c.last_name].filter(Boolean).join('_')}.pdf`,
          path: path.join(__dirname, "..", "public", letterUrl),
        },
      ],
    });

    if (c.offer_status === "draft") {
      await candidates.update({ offer_status: "sent" }, { where: { id } });
    }

    responseCodes.SUCCESS.data = { sent_to: recipient };
    responseCodes.SUCCESS.message = `Offer letter sent to ${recipient}`;
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to send offer letter email";
    return responseCodes.BAD_REQUEST;
  }
};

exports.bulkEmailOfferLetters = async function (ids) {
  const sent = [], failed = [];
  for (const id of ids) {
    try {
      const res = await exports.emailOfferLetter(id, null);
      if (res.code === "100") {
        sent.push(id);
      } else {
        failed.push({ id, reason: res.message });
      }
    } catch (e) {
      failed.push({ id, reason: e.message });
    }
  }
  const data = { sent, failed };
  if (sent.length === 0) {
    responseCodes.BAD_REQUEST.data = data;
    responseCodes.BAD_REQUEST.message = `Failed to send all ${ids.length} letter(s)`;
    return responseCodes.BAD_REQUEST;
  }
  responseCodes.SUCCESS.data = data;
  responseCodes.SUCCESS.message = `Sent ${sent.length} letter(s) successfully${failed.length ? `, ${failed.length} failed` : ""}`;
  return responseCodes.SUCCESS;
};

exports.convertToEmployee = async function (body) {
  const t = await sequelize.transaction();
  try {
    const candidate = await candidates.findOne({ where: { id: body.id, status: 1 }, transaction: t });
    if (!candidate) {
      await t.rollback();
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Candidate not found";
      return responseCodes.NOT_FOUND;
    }
    if (candidate.offer_status === "converted") {
      await t.rollback();
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "Candidate has already been converted to an employee";
      return responseCodes.BAD_REQUEST;
    }
    if (candidate.offer_status !== "accepted") {
      await t.rollback();
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "Candidate must have accepted the offer before conversion";
      return responseCodes.BAD_REQUEST;
    }
    if (!body.role_id) {
      await t.rollback();
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "role_id is required to convert a candidate to an employee";
      return responseCodes.BAD_REQUEST;
    }

    const password = await bcrypt.hash(body.password || candidate.mobile, saltRounds);

    const user = await usersMaster.create(
      {
        first_name: candidate.first_name,
        last_name: candidate.last_name,
        mobile: candidate.mobile,
        email: candidate.email,
        password,
        designation_id: candidate.designation_id,
        department_id: candidate.department_id,
        reporting_manager_id: candidate.reporting_manager_id,
        role_id: body.role_id,
        doj: candidate.doj,
        status: true,
        created_by: body.created_by,
        created_date: body.created_date,
      },
      { transaction: t }
    );

    await usersSalaryDetails.create(
      {
        user_id: user.id,
        ctc: candidate.ctc,
        basic_salary: candidate.basic_salary,
        dearness_allowance: candidate.dearness_allowance,
        city_allowance: candidate.city_allowance,
        hra: candidate.hra,
        conveyance: candidate.conveyance,
        medical_allowance: candidate.medical_allowance,
        lta: candidate.lta,
        special_allowance: candidate.special_allowance,
        exgratia: candidate.bonus,
        variable_pay_1: candidate.variable_pay_1,
        variable_pay_1_frequency: candidate.variable_pay_1_frequency,
        variable_pay_2: candidate.variable_pay_2,
        variable_pay_2_frequency: candidate.variable_pay_2_frequency,
        variable_pay_3: candidate.variable_pay_3,
        variable_pay_3_frequency: candidate.variable_pay_3_frequency,
        variable_pay_4: candidate.variable_pay_4,
        variable_pay_4_frequency: candidate.variable_pay_4_frequency,
        fuel_transport_expenses: candidate.fuel_transport_expenses,
        medical_insurance: candidate.medical_insurance,
        accidental_insurance: candidate.accidental_insurance,
        uniform: candidate.uniform,
        // PF (Employee)/Professional Tax/Income Tax/ESI (Employee)/Loan/Other Deduction aren't
        // collected at offer stage anymore - left at their model defaults (0) here; HR sets them
        // for real in Employee Salary Master once the candidate is actually hired.
        pf_employer: candidate.pf_employer,
        esi_employer: candidate.esi_employer,
        gratuity: candidate.gratuity,
        gross_salary: candidate.gross_salary,
        total_deductions: candidate.total_deductions,
        net_salary: candidate.net_salary,
        effective_from: candidate.doj,
        created_by: body.created_by,
        created_date: body.created_date,
      },
      { transaction: t }
    );

    await candidates.update(
      { offer_status: "converted", converted_user_id: user.id, modified_by: body.created_by, modified_date: body.created_date },
      { where: { id: body.id }, transaction: t }
    );

    await t.commit();

    responseCodes.SUCCESS.data = { user_id: user.id };
    responseCodes.SUCCESS.message = "Candidate converted to employee successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    let errorMsg = "Failed to convert candidate to employee";
    if (e.name === "SequelizeUniqueConstraintError") {
      errorMsg = `Unique Constraint Error: ${e.errors.map((err) => err.message).join(", ")}`;
    }
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = errorMsg;
    return responseCodes.BAD_REQUEST;
  }
};
