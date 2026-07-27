const { loanAdvanceRequest, loanAdvancePaymentHistory } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

exports.addData = async function (body) {
  try {
    // HR raising a request on behalf of an employee (created_by !== employee_id)
    // must attach supporting documentation; self-service requests may omit it.
    const isRaisedByHrForSomeoneElse = String(body.data?.created_by) !== String(body.data?.employee_id);
    if (isRaisedByHrForSomeoneElse && !body.data?.attachment_url) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "An attachment is required when applying from the HR module";
      return responseCodes.BAD_REQUEST;
    }
    const result = await loanAdvanceRequest.create(body.data);
    responseCodes.SUCCESS.data = result.id;
    responseCodes.SUCCESS.message = "Loan / Advance Request Submitted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Submit Request";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateData = async function (body) {
  try {
    await loanAdvanceRequest.update(body.data, {
      where: { id: body.id },
    });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Row Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
    await loanAdvanceRequest.update(body.data, {
      where: { id: body.id },
    });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Row Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Row";
    return responseCodes.BAD_REQUEST;
  }
};

const selectWithNames = `
  SELECT lar.*,
    CASE
        WHEN lar.status = 0 THEN 'Pending'
        WHEN lar.status = 1 THEN 'Approved'
        WHEN lar.status = 2 THEN 'Rejected'
        ELSE 'Unknown'
    END AS status_name,
    CONCAT(emp.first_name, ' ', emp.last_name) AS employee_name,
    CASE
        WHEN lar.status = 0 THEN CONCAT(emp.first_name, ' ', emp.last_name)
        WHEN lar.status = 1 THEN CONCAT(appr.first_name, ' ', appr.last_name)
        WHEN lar.status = 2 THEN CONCAT(appr.first_name, ' ', appr.last_name)
        ELSE 'Unknown'
    END AS action_by_name,
    CASE
        WHEN lar.status = 0 THEN lar.created_date
        WHEN lar.status = 1 THEN lar.modified_date
        WHEN lar.status = 2 THEN lar.modified_date
        ELSE null
    END AS action_by_date
  FROM loan_advance_request AS lar
  JOIN users_master AS emp ON lar.employee_id = emp.id
  LEFT JOIN users_master AS appr ON lar.modified_by = appr.id
`;

exports.getAllData = async function (body) {
  try {
    const hasStatusFilter = body?.status !== undefined && body?.status !== null;
    const query = `${selectWithNames}
      WHERE lar.status != 3 ${hasStatusFilter ? "AND lar.status = :status" : ""}
      ORDER BY lar.id DESC;`;
    const data = await sequelize.query(query, {
      replacements: { status: body?.status },
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};

// Records one deduction/payment against a loan: inserts a ledger row AND bumps
// the parent's total_paid in the same transaction, so the two can never drift.
exports.recordPayment = async function (body) {
  const t = await sequelize.transaction();
  try {
    const { loan_advance_request_id, amount, remarks, created_by, created_date } = body || {};

    if (!loan_advance_request_id || !amount || Number(amount) <= 0) {
      await t.rollback();
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "A valid loan request and payment amount are required";
      return responseCodes.BAD_REQUEST;
    }

    const loan = await loanAdvanceRequest.findOne({ where: { id: loan_advance_request_id }, transaction: t });
    if (!loan) {
      await t.rollback();
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Loan / Advance request not found";
      return responseCodes.NOT_FOUND;
    }

    const remaining = Number(loan.amount) - Number(loan.total_paid || 0);
    if (Number(amount) > remaining) {
      await t.rollback();
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = `Payment cannot exceed the remaining balance of ${remaining}`;
      return responseCodes.BAD_REQUEST;
    }

    await loanAdvancePaymentHistory.create({
      loan_advance_request_id, amount, remarks, created_by, created_date,
    }, { transaction: t });

    await loanAdvanceRequest.update(
      { total_paid: Number(loan.total_paid || 0) + Number(amount), modified_by: created_by, modified_date: created_date },
      { where: { id: loan_advance_request_id }, transaction: t }
    );

    await t.commit();
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Payment Recorded Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Record Payment";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getPaymentHistory = async function (loan_advance_request_id) {
  try {
    if (!loan_advance_request_id) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "Loan / Advance request ID is required";
      return responseCodes.BAD_REQUEST;
    }
    const query = `
      SELECT lph.*, CONCAT(u.first_name, ' ', u.last_name) AS recorded_by_name
      FROM loan_advance_payment_history lph
      JOIN users_master u ON u.id = lph.created_by
      WHERE lph.loan_advance_request_id = :loan_advance_request_id
      ORDER BY lph.created_date DESC;`;
    const data = await sequelize.query(query, {
      replacements: { loan_advance_request_id },
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Payment History";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getOneData = async function (employee_id) {
  try {
    if (!employee_id) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "Employee ID is required";
      return responseCodes.BAD_REQUEST;
    }
    const query = `${selectWithNames}
      WHERE lar.employee_id = :employee_id AND lar.status != 3
      ORDER BY lar.id DESC;`;
    const data = await sequelize.query(query, {
      replacements: { employee_id },
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
