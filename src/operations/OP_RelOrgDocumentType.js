const { relOrgDocumentType, documentTypeMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");

exports.addData = async function (body) {
	try {
		const data = { ...body.data };
		// frontend sends a single uploaded file path; the column is an array, so wrap it
		if (data.doc_copy && !Array.isArray(data.doc_copy)) {
			data.doc_copy = [data.doc_copy];
		}
		var result = await relOrgDocumentType.create(data);
		responseCodes.SUCCESS.data = result.id;
		responseCodes.SUCCESS.message = "Row Added Successfully";
		return responseCodes.SUCCESS;
	} catch (e) {
		responseCodes.BAD_REQUEST.data = e;
		responseCodes.BAD_REQUEST.message = "Failed to Add Row";
		return responseCodes.BAD_REQUEST;
	}
};

// rel_org_document_type has no soft-delete column, so this is a hard delete
exports.deleteData = async function (body) {
	try {
		await relOrgDocumentType.destroy({
			where: { id: body.id }
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

// Documents tab: id + flat document_type name, matching the table column already in the UI
exports.getOrgDocuments = async function (org_id) {
	try {
		var data = await relOrgDocumentType.findAll({
			where: { org_id },
			include: [{ model: documentTypeMaster, attributes: [] }],
			attributes: ["id", [sequelize.col("document_type_master.name"), "document_type"]],
			order: [["id", "DESC"]],
			raw: true
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

// Same documents, full row (doc_copy/report_date/expiry_date) with the linked document type nested
exports.getOrgDocuments_docWise = async function (org_id) {
	try {
		var data = await relOrgDocumentType.findAll({
			where: { org_id },
			include: [{ model: documentTypeMaster }],
			order: [["doc_type_id", "ASC"]]
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

// Documents for one org ordered by expiry, for a supplier compliance/credit review
exports.getSupplierCreditReport = async function (org_id) {
	try {
		var data = await relOrgDocumentType.findAll({
			where: { org_id },
			include: [{ model: documentTypeMaster }],
			order: [["expiry_date", "ASC"]]
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
