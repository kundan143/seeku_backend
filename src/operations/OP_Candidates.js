const { candidates, usersMaster, usersSalaryDetails } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const transporter = require("../services/mailTransporterService");

const saltRounds = 10;

const ALLOWED_STATUSES = ["draft", "sent", "accepted", "rejected", "withdrawn"];

exports.addData = async function (body) {
  try {
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

exports.updateData = async function (body) {
  try {
    await candidates.update(body.data, { where: { id: body.id } });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Candidate Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Candidate";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
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

exports.getOneData = async function (id) {
  try {
    const query = `
      SELECT c.*,
             CONCAT(c.first_name, ' ', c.last_name) AS candidate_name,
             dm.name  AS department_name,
             dm2.designation AS designation_name,
             CONCAT(um.first_name, ' ', um.last_name) AS reporting_manager_name
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

async function fetchCandidateForLetter(id) {
  const query = `
    SELECT c.*,
           CONCAT(c.first_name, ' ', c.last_name) AS candidate_name,
           dm.name  AS department_name,
           dm2.designation AS designation_name,
           CONCAT(um.first_name, ' ', um.last_name) AS reporting_manager_name
    FROM candidates c
    LEFT JOIN department_master  dm  ON dm.id  = c.department_id
    LEFT JOIN designation_master dm2 ON dm2.id = c.designation_id
    LEFT JOIN users_master       um  ON um.id  = c.reporting_manager_id
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

    const lettersDir = path.join(__dirname, "..", "public", "offer-letters");
    if (!fs.existsSync(lettersDir)) fs.mkdirSync(lettersDir, { recursive: true });

    const fileName = `offer_${id}.pdf`;
    const filePath = path.join(lettersDir, fileName);
    const letterUrl = `/offer-letters/${fileName}`;

    const fmt = (n) => "Rs. " + (parseFloat(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—");

    await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const W = doc.page.width - 80;
      const L = 40;

      // ── Header ──────────────────────────────────────────────
      doc.fontSize(18).font("Helvetica-Bold").fillColor("#1a3c5e")
         .text("ADVANCE CABLE TECHNOLOGIES LIMITED", L, 40, { align: "center", width: W });
      doc.fontSize(10).font("Helvetica").fillColor("#555555")
         .text("Offer Letter", L, doc.y + 2, { align: "center", width: W });
      doc.moveTo(L, doc.y + 8).lineTo(L + W, doc.y + 8).strokeColor("#1a3c5e").lineWidth(1.5).stroke();

      // ── Date + Candidate address ─────────────────────────────
      doc.y += 16;
      doc.fontSize(9).font("Helvetica").fillColor("#333333")
         .text(`Date: ${fmtDate(c.offer_date)}`, L, doc.y);
      doc.y += 16;
      doc.font("Helvetica-Bold").text(c.candidate_name, L, doc.y);
      doc.font("Helvetica").text(c.email, L, doc.y + 12);
      doc.text(c.mobile, L, doc.y + 24);
      doc.y += 40;

      // ── Salutation + body ─────────────────────────────────────
      doc.font("Helvetica-Bold").fontSize(10).text(`Dear ${c.first_name},`, L, doc.y);
      doc.y += 16;
      doc.font("Helvetica").fontSize(9.5).fillColor("#111111").text(
        `We are pleased to offer you the position of ${c.designation_name || "—"} in the ${c.department_name || "—"} department at Advance Cable Technologies Limited. Your proposed date of joining is ${fmtDate(c.doj)}. This letter sets out the key terms of employment being offered to you.`,
        L, doc.y, { width: W, align: "justify" }
      );
      doc.y += 8;

      // ── CTC highlight ──────────────────────────────────────────
      doc.y += 8;
      const ctcY = doc.y;
      doc.roundedRect(L, ctcY, W, 40, 4).fillAndStroke("#1a7a4c", "#1a7a4c");
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff").text("ANNUAL CTC (Cost to Company)", L + 12, ctcY + 8);
      doc.font("Helvetica-Bold").fontSize(15).fillColor("#ffffff").text(fmt(c.ctc), L + 12, ctcY + 20);
      doc.y = ctcY + 52;

      // ── Salary breakup (monthly) ───────────────────────────────
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#1a3c5e").text("Monthly Salary Breakup", L, doc.y);
      doc.y += 8;

      const half = W / 2 - 4;
      const earnX = L, dedX = L + W / 2 + 4;
      const tableTop = doc.y;

      const earnings = [
        ["Basic Salary",       c.basic_salary],
        ["Dearness Allowance", c.dearness_allowance],
        ["City Allowance",     c.city_allowance],
        ["HRA",                c.hra],
        ["Conveyance",         c.conveyance],
        ["Medical Allowance",  c.medical_allowance],
        ["LTA",                c.lta],
        ["Special Allowance",  c.special_allowance],
        ["Bonus",              c.bonus],
      ];
      const deductions = [
        ["PF (Employee)",    c.pf_employee],
        ["Professional Tax", c.professional_tax],
        ["Income Tax (TDS)", c.income_tax],
        ["ESI (Employee)",   c.employee_state_insurance],
        ["Other Deductions", c.other_deduction],
      ];

      const drawTable = (title, rows, xStart, bgHeader) => {
        doc.rect(xStart, tableTop, half, 20).fill(bgHeader);
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff").text(title, xStart + 6, tableTop + 6, { width: half - 6 });
        let ty = tableTop + 20;
        rows.forEach(([label, val], idx) => {
          const rowBg = idx % 2 === 0 ? "#f9fafb" : "#ffffff";
          doc.rect(xStart, ty, half, 16).fill(rowBg);
          doc.font("Helvetica").fontSize(8).fillColor("#333333").text(label, xStart + 6, ty + 4, { width: half / 2 - 6 });
          doc.font("Helvetica").fontSize(8).fillColor("#111111").text(fmt(val), xStart + half / 2, ty + 4, { width: half / 2 - 6, align: "right" });
          ty += 16;
        });
        doc.rect(xStart, tableTop, half, ty - tableTop).strokeColor("#d0dce8").lineWidth(0.5).stroke();
        return ty;
      };

      const earnEnd = drawTable("EARNINGS (Monthly)", earnings, earnX, "#2e6da4");
      drawTable("DEDUCTIONS (Monthly)", deductions, dedX, "#c0392b");
      doc.y = Math.max(earnEnd, tableTop + 20 + deductions.length * 16) + 10;

      const summaryData = [
        ["Gross Salary",     c.gross_salary,     "#2e6da4"],
        ["Total Deductions", c.total_deductions, "#c0392b"],
        ["Net Salary",       c.net_salary,       "#1a7a4c"],
      ];
      const sW = W / 3;
      const summaryY = doc.y;
      summaryData.forEach(([label, val, color], i) => {
        const sx = L + i * sW;
        doc.roundedRect(sx + 2, summaryY, sW - 6, 40, 4).fillAndStroke(color, color);
        doc.font("Helvetica-Bold").fontSize(8).fillColor("#ffffff").text(label, sx + 8, summaryY + 6, { width: sW - 14 });
        doc.font("Helvetica-Bold").fontSize(12).fillColor("#ffffff").text(fmt(val), sx + 8, summaryY + 20, { width: sW - 14 });
      });
      doc.y = summaryY + 52;

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
    console.log(e);
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
          filename: `Offer_Letter_${c.first_name}_${c.last_name}.pdf`,
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
        username: body.username || candidate.mobile,
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
        bonus: candidate.bonus,
        pf_employee: candidate.pf_employee,
        professional_tax: candidate.professional_tax,
        income_tax: candidate.income_tax,
        employee_state_insurance: candidate.employee_state_insurance,
        loan_deduction: candidate.loan_deduction,
        other_deduction: candidate.other_deduction,
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
