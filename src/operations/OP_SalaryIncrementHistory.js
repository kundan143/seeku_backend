const { salaryIncrementHistory, incrementLetterMailLog, pdfTemplateMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes, Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const transporter = require("../services/mailTransporterService");
const { mergeTemplate, renderHtmlToPdfFile, getLogoDataUri } = require("../services/pdfTemplateService");
const logger = require("../services/dailyLogService");

const fmt = (n) => "Rs. " + (parseFloat(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

// Every field snapshotted into old_salary_snapshot/new_salary_snapshot (OP_usersSalaryDetails
// AMOUNT_FIELDS), mapped to the {{old_<tag>_fmt}}/{{new_<tag>_fmt}} merge tags the Increment
// Letter template can reference - same field set/order as the frontend's HISTORY_DETAIL_FIELDS
// (employee-salary-master.component.ts) so the letter can show the exact same full breakdown as
// the "View Details" dialog, not just the 4-row summary it shipped with.
const LETTER_COMPONENT_FIELDS = [
  { field: "ctc", tag: "ctc" },
  { field: "basic_salary", tag: "basic" },
  { field: "dearness_allowance", tag: "da" },
  { field: "city_allowance", tag: "city_allowance" },
  { field: "hra", tag: "hra" },
  { field: "conveyance", tag: "conveyance" },
  { field: "medical_allowance", tag: "medical_allowance" },
  { field: "travel_allowance", tag: "travel_allowance" },
  { field: "special_allowance", tag: "special_allowance" },
  { field: "exgratia", tag: "exgratia" },
  { field: "pf_employee", tag: "pf_employee" },
  { field: "professional_tax", tag: "professional_tax" },
  { field: "income_tax", tag: "income_tax" },
  { field: "employee_state_insurance", tag: "esi_employee" },
  { field: "loan_deduction", tag: "loan_deduction" },
  { field: "other_deduction", tag: "other_deduction" },
  { field: "pf_employer", tag: "pf_employer" },
  { field: "esi_employer", tag: "esi_employer" },
  { field: "gratuity", tag: "gratuity" },
  { field: "gross_salary", tag: "gross" },
  { field: "total_deductions", tag: "total_deductions" },
  { field: "net_salary", tag: "net_salary" },
];

// Drops a Compensation Summary <tr> entirely when a component was 0 both before and after the
// increment (e.g. City Allowance/Exgratia/Loan Deduction unused by this employee) - same idea as
// OP_salaryPayment's stripRowIfZero, adapted for <tr> rows instead of <div> rows and for a pair
// of old/new tags instead of one. Matched on the "new_<tag>_fmt" placeholder, which is enough to
// anchor the whole row since both tags live in the same <tr>..</tr>. Run on the raw template
// BEFORE mergeTemplate() - checking real numbers here is simpler and more reliable than pattern
// -matching already-formatted "Rs. 0.00" strings after the merge.
function stripCompensationRowIfZero(html, tag, oldValue, newValue) {
  if ((Number(oldValue) || 0) > 0 || (Number(newValue) || 0) > 0) return html;
  const rowPattern = new RegExp(
    `<tr\\b[^>]*>(?:(?!<\\/tr>)[\\s\\S])*?\\{\\{\\s*new_${tag}_fmt\\s*\\}\\}(?:(?!<\\/tr>)[\\s\\S])*?<\\/tr>\\s*`,
    "i"
  );
  return html.replace(rowPattern, "");
}

// Fetches one increment event with everything the letter template's merge tags need -
// employee/company info via the same joins OP_salaryPayment.generateSlip uses, plus the
// old/new snapshot JSONB columns that are the whole reason this table exists.
async function fetchLetterRow(id, transaction) {
  const query = `
    SELECT sih.*,
           CONCAT(um.first_name, ' ', um.middle_name, ' ', um.last_name) AS emp_name,
           um.email AS emp_email, um.emp_code, um.doj,
           dm.name         AS department_name,
           dm2.designation AS designation_name,
           CASE WHEN sih.disbursement_month IS NOT NULL
                THEN TRIM(TO_CHAR(TO_DATE(sih.disbursement_month::TEXT, 'MM'), 'Month'))
                ELSE NULL END AS disbursement_month_name,
           cbm.client_name AS company_name,
           cbm.client_logo AS company_logo,
           olm.full_address AS company_address,
           city.name        AS company_city,
           state.name       AS company_state,
           olm.pincode      AS company_pincode,
           rolm.full_address AS regd_office_address,
           rolm.city         AS regd_office_city,
           rolm.state        AS regd_office_state,
           rolm.pincode      AS regd_office_pincode,
           rolm.email        AS regd_office_email
    FROM salary_increment_history sih
    LEFT JOIN users_master           um    ON um.id    = sih.user_id
    LEFT JOIN department_master      dm    ON dm.id    = um.department_id
    LEFT JOIN designation_master     dm2   ON dm2.id   = um.designation_id
    LEFT JOIN client_branding_master cbm   ON cbm.id   = 1
    LEFT JOIN office_location_master olm   ON olm.id   = 1
    LEFT JOIN city_master            city  ON city.id  = olm.city_id
    LEFT JOIN state_master           state ON state.id = olm.state_id
    LEFT JOIN LATERAL (
      SELECT r.full_address, r.email, r.pincode,
             rc.name AS city, rs.name AS state
      FROM office_location_master r
      LEFT JOIN city_master  rc ON rc.id = r.city_id
      LEFT JOIN state_master rs ON rs.id = r.state_id
      WHERE r.is_registered_office = true AND r.status = 1
      LIMIT 1
    ) rolm ON true
    WHERE sih.id = :id AND sih.status = 1
    LIMIT 1`;
  const rows = await sequelize.query(query, { replacements: { id }, type: QueryTypes.SELECT, transaction });
  return rows[0] || null;
}

function buildMergeData(sih) {
  const oldSnap = sih.old_salary_snapshot || {};
  const newSnap = sih.new_salary_snapshot || {};
  const cityStatePin = [sih.company_city, sih.company_state].filter(Boolean).join(", ")
    + (sih.company_pincode ? ` - ${sih.company_pincode}` : "");
  const regdCityStatePin = [sih.regd_office_city, sih.regd_office_state].filter(Boolean).join(", ")
    + (sih.regd_office_pincode ? ` - ${sih.regd_office_pincode}` : "");
  const regdOfficeLine = sih.regd_office_address
    ? `Regd. Office: ${sih.regd_office_address}` + (regdCityStatePin ? `, ${regdCityStatePin}` : "")
    : "";
  const regdContactLine = sih.regd_office_email ? `Email: ${sih.regd_office_email}` : "";
  const disbursementMonthYear = sih.disbursement_month_name
    ? `${sih.disbursement_month_name.trim()} ${sih.disbursement_year}`
    : "—";
  const incrementTypeLabel = sih.increment_type === "percentage"
    ? `${(Number(sih.increment_value) || 0).toFixed(2)}%`
    : `Flat ${fmt(sih.increment_value)}`;
  const incrementAmount = (Number(newSnap.gross_salary) || 0) - (Number(oldSnap.gross_salary) || 0);
  const incrementPercent = oldSnap.gross_salary
    ? (incrementAmount / Number(oldSnap.gross_salary)) * 100
    : 0;
  const totalArrear = Number(sih.total_arrear_amount) || 0;
  const arrearLine = totalArrear > 0
    ? `An arrear amount of ${fmt(totalArrear)} for the period prior to disbursement will be paid along with your ${disbursementMonthYear} salary.`
    : "";

  const mergeData = {
    company_name: sih.company_name || "ADVANCE CABLE TECHNOLOGIES LIMITED",
    company_logo_data_uri: getLogoDataUri(sih.company_logo),
    company_address: sih.company_address || "",
    company_city_state_pin: cityStatePin,
    regd_office_line: regdOfficeLine,
    regd_contact_line: regdContactLine,
    letter_date_formatted: new Date().toLocaleDateString("en-IN"),
    emp_code: sih.emp_code || "—",
    emp_name: sih.emp_name || "—",
    department_name: sih.department_name || "—",
    designation_name: sih.designation_name || "—",
    doj_formatted: sih.doj ? new Date(sih.doj).toLocaleDateString("en-IN") : "—",
    effective_from_formatted: sih.effective_from ? new Date(sih.effective_from).toLocaleDateString("en-IN") : "—",
    increment_type_label: incrementTypeLabel,
    increment_amount_fmt: fmt(incrementAmount),
    increment_percent_fmt: `${incrementPercent.toFixed(2)}%`,
    disbursement_month_year: disbursementMonthYear,
    total_arrear_amount_fmt: fmt(totalArrear),
    arrear_line: arrearLine,
  };

  LETTER_COMPONENT_FIELDS.forEach(({ field, tag }) => {
    mergeData[`old_${tag}_fmt`] = fmt(oldSnap[field]);
    mergeData[`new_${tag}_fmt`] = fmt(newSnap[field]);
  });

  return mergeData;
}

// Read-only history of increments applied via Employee Salary Master's "Give Increment"
// action (see OP_usersSalaryDetails.applyIncrement, which is the only writer of this table).
exports.getAllData = async function () {
  try {
    const query = `
      SELECT sih.*,
             CONCAT(um.first_name, ' ', um.middle_name, ' ', um.last_name) AS emp_name,
             dm.name AS department_name,
             dm2.designation AS designation_name,
             CASE WHEN sih.disbursement_month IS NOT NULL
                  THEN TRIM(TO_CHAR(TO_DATE(sih.disbursement_month::TEXT, 'MM'), 'Month'))
                  ELSE NULL END AS disbursement_month_name
      FROM salary_increment_history sih
      LEFT JOIN users_master um ON um.id = sih.user_id
      LEFT JOIN department_master dm ON dm.id = um.department_id
      LEFT JOIN designation_master dm2 ON dm2.id = um.designation_id
      WHERE sih.status = 1
      ORDER BY sih.id DESC`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Increment History";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getDataByUserId = async function (user_id) {
  try {
    const query = `
      SELECT sih.*,
             CONCAT(um.first_name, ' ', um.middle_name, ' ', um.last_name) AS emp_name,
             CASE WHEN sih.disbursement_month IS NOT NULL
                  THEN TRIM(TO_CHAR(TO_DATE(sih.disbursement_month::TEXT, 'MM'), 'Month'))
                  ELSE NULL END AS disbursement_month_name
      FROM salary_increment_history sih
      LEFT JOIN users_master um ON um.id = sih.user_id
      WHERE sih.user_id = :user_id AND sih.status = 1
      ORDER BY sih.id DESC`;
    const data = await sequelize.query(query, {
      replacements: { user_id },
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Increment History";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getOneData = async function (id) {
  try {
    const data = await salaryIncrementHistory.findAll({ where: { id: id } });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Increment History";
    return responseCodes.BAD_REQUEST;
  }
};

// Renders the Increment Letter PDF for one increment event via Puppeteer, same pattern as
// OP_salaryPayment.generateSlip: pins whichever pdf_template_master row is used so a later
// regeneration (cache-miss inside emailLetter) can't retroactively change an already-issued
// letter just because the admin edited/replaced the default template afterwards.
exports.generateLetter = async function (id) {
  const t = await sequelize.transaction();
  try {
    const sih = await fetchLetterRow(id, t);
    if (!sih) {
      await t.rollback();
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Increment record not found";
      return responseCodes.NOT_FOUND;
    }

    let template = null;
    if (sih.pdf_template_id) {
      template = await pdfTemplateMaster.findOne({ where: { id: sih.pdf_template_id }, transaction: t });
    }
    if (!template) {
      template = await pdfTemplateMaster.findOne({
        where: { template_type: "increment_letter", is_default: true, is_active: 1 },
        transaction: t
      });
    }
    if (!template) {
      await t.rollback();
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "No active PDF template configured for Increment Letter — set one up in PDF Template Master.";
      return responseCodes.BAD_REQUEST;
    }

    const lettersDir = path.join(__dirname, "..", "public", "increment-letters");
    if (!fs.existsSync(lettersDir)) fs.mkdirSync(lettersDir, { recursive: true });

    const fileName = `increment_letter_${id}.pdf`;
    const filePath = path.join(lettersDir, fileName);
    const letterUrl = `/increment-letters/${fileName}`;

    const oldSnap = sih.old_salary_snapshot || {};
    const newSnap = sih.new_salary_snapshot || {};
    let templateHtml = template.html_content;
    LETTER_COMPONENT_FIELDS.forEach(({ field, tag }) => {
      templateHtml = stripCompensationRowIfZero(templateHtml, tag, oldSnap[field], newSnap[field]);
    });

    const mergedHtml = mergeTemplate(templateHtml, buildMergeData(sih));
    await renderHtmlToPdfFile(mergedHtml, filePath);

    await salaryIncrementHistory.update(
      { letter_url: letterUrl, pdf_template_id: template.id },
      { where: { id }, transaction: t }
    );
    await t.commit();

    responseCodes.SUCCESS.data = { letter_url: letterUrl };
    responseCodes.SUCCESS.message = "Increment letter generated successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to generate increment letter";
    return responseCodes.BAD_REQUEST;
  }
};

// Emails the Increment Letter to the employee, same claim-before-send pattern as
// OP_salaryPayment.emailSlip: atomically flips mail_status 0->1 before sending anything, so an
// overlapping duplicate click can't both win the send while the (slow, SMTP-bound) mail is in
// flight. `force` lets HR deliberately resend an already-sent letter.
exports.emailLetter = async function (id, toEmail, sentBy, force) {
  let claimed = false;
  let sih, recipient, subject;
  try {
    sih = await fetchLetterRow(id);
    if (!sih) {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Increment record not found";
      return responseCodes.NOT_FOUND;
    }

    recipient = toEmail || sih.emp_email;
    if (!recipient) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "No email address found for this employee";
      return responseCodes.BAD_REQUEST;
    }

    const [claimedCount] = await salaryIncrementHistory.update(
      { mail_status: 1, mail_sent_date: new Date() },
      { where: force ? { id } : { id, mail_status: { [Op.ne]: 1 } } }
    );
    if (claimedCount === 0) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "Increment letter has already been sent (or is currently being sent) for this record";
      return responseCodes.BAD_REQUEST;
    }
    claimed = true;

    if (!sih.letter_url || !fs.existsSync(path.join(__dirname, "..", "public", sih.letter_url))) {
      const generated = await exports.generateLetter(id);
      if (generated.code !== "100") return generated;
      sih.letter_url = generated.data.letter_url;
    }

    const effectiveFrom = sih.effective_from ? new Date(sih.effective_from).toLocaleDateString("en-IN") : "—";
    subject = `Increment Letter — Effective ${effectiveFrom}`;
    const html = `
        <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
            </head>
            <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
                <tr>
                  <td align="center">
                    <table width="650" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e5e5;">
                      <tr>
                        <td align="center" style="background:#0d6efd;padding:30px;">
                            <h2 style="margin:0;color:#ffffff;font-size:28px;">
                                Advance Cable Technologies Ltd.
                            </h2>
                            <p style="margin:8px 0 0;color:#eaf2ff;font-size:16px;">
                                Increment Letter
                            </p>
                        </td>
                      </tr>
                      <tr>
                          <td style="padding:40px;">
                              <p style="font-size:16px;color:#333;margin-top:0;">Dear <strong>${sih.emp_name}</strong>,</p>
                              <p style="font-size:15px;color:#555;line-height:26px;">Congratulations! We are pleased to share your <strong>Increment Letter</strong>, effective <strong>${effectiveFrom}</strong>.</p>
                              <p style="font-size:15px;color:#555;line-height:26px;">Please find the detailed letter attached with this email for your records.</p>
                              <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;">
                                  <tr>
                                      <td align="center">
                                          <div style="display:inline-block;background:#e8f4ff;border:1px solid #cfe2ff;padding:18px 25px;border-radius:8px;color:#0d6efd;font-size:15px;">
                                              📎 <strong>Your Increment Letter PDF is attached with this email.</strong>
                                          </div>
                                      </td>
                                  </tr>
                              </table>
                              <p style="font-size:15px;color:#555;line-height:26px;">Thank you for your continued dedication, hard work, and valuable contribution to the organization.</p>
                              <br>
                              <p style="margin:0;font-size:15px;color:#333;">Best Regards,</p>
                              <p style="margin-top:8px;font-size:15px;color:#333;">
                                  <strong>HR Department</strong><br>Advance Cable Technologies Ltd.
                              </p>
                          </td>
                      </tr>
                      <tr>
                          <td align="center" style="background:#f8f9fa;padding:25px;font-size:12px;color:#777;line-height:20px;">
                              This is an automatically generated email. Please do not reply to this email.<br>
                              For any queries, please contact the HR Department.<br><br>
                              © ${new Date().getFullYear()} Advance Cable Technologies Ltd. All Rights Reserved.
                          </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>`;

    await transporter.sendMail({
      from: process.env.EXP_HANDLE_USER_NAME || 'Advance Cable Technologies <tech@advancecable.in>',
      to: recipient,
      subject,
      html,
      attachments: [
        {
          filename: `Increment_Letter_${id}.pdf`,
          path: path.join(__dirname, "..", "public", sih.letter_url),
        },
      ],
    });

    await incrementLetterMailLog.create({
      salary_increment_history_id: id,
      user_id: sih.user_id,
      recipient_email: recipient,
      subject,
      letter_url: sih.letter_url,
      status: 1,
      sent_by: sentBy || null,
      sent_date: new Date(),
    });

    responseCodes.SUCCESS.data = { sent_to: recipient };
    responseCodes.SUCCESS.message = `Increment letter sent to ${recipient}`;
    return responseCodes.SUCCESS;
  } catch (e) {
    if (claimed) {
      try {
        await salaryIncrementHistory.update({ mail_status: 0, mail_sent_date: null }, { where: { id } });
        await incrementLetterMailLog.create({
          salary_increment_history_id: id,
          user_id: sih?.user_id,
          recipient_email: recipient || '',
          subject: subject || null,
          letter_url: sih?.letter_url || null,
          status: 0,
          sent_by: sentBy || null,
          sent_date: new Date(),
        });
      } catch (revertErr) {
        logger.error({ message: `emailLetter: failed to release claim for id ${id}`, error: revertErr.message });
      }
    }
    logger.error({ message: `emailLetter failed for id ${id}`, error: e.message });
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to send increment letter email";
    return responseCodes.BAD_REQUEST;
  }
};
