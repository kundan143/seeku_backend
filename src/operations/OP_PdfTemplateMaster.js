const { pdfTemplateMaster } = require("../models");
const { sequelize } = require("../config/database-connection");
const { responseCodes } = require("../services/baseReponse");
const { extractMergeTags, mergeTemplate, renderHtmlToPdfBuffer } = require("../services/pdfTemplateService");
const { TEMPLATE_SCHEMAS } = require("../services/pdfTemplateSchemas");

function validateMergeTags(templateType, htmlContent) {
	const schema = TEMPLATE_SCHEMAS[templateType];
	if (!schema) return null; // Unknown/reserved type — no whitelist to validate against yet.

	const usedTags = extractMergeTags(htmlContent);
	const unknownTags = usedTags.filter((tag) => !schema.tags.includes(tag));
	if (unknownTags.length) {
		return `Unknown merge tag(s) for ${templateType}: ${unknownTags.map((t) => `{{${t}}}`).join(", ")}`;
	}
	return null;
}

exports.addData = async function (body) {
	try {
		const validationError = validateMergeTags(body.data.template_type, body.data.html_content);
		if (validationError) {
			responseCodes.BAD_REQUEST.data = null;
			responseCodes.BAD_REQUEST.message = validationError;
			return responseCodes.BAD_REQUEST;
		}
		var result = await pdfTemplateMaster.create(body.data);
		responseCodes.SUCCESS.data = result.id;
		responseCodes.SUCCESS.message = "Row Added Successfully";
		return responseCodes.SUCCESS;
	} catch (e) {
		responseCodes.BAD_REQUEST.data = e;
		responseCodes.BAD_REQUEST.message = "Failed to Add Row";
		return responseCodes.BAD_REQUEST;
	}
};

exports.updateData = async function (body) {
	try {
		const validationError = validateMergeTags(body.data.template_type, body.data.html_content);
		if (validationError) {
			responseCodes.BAD_REQUEST.data = null;
			responseCodes.BAD_REQUEST.message = validationError;
			return responseCodes.BAD_REQUEST;
		}
		await pdfTemplateMaster.update(body.data, {
			where: { id: body.id }
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
		await pdfTemplateMaster.destroy({
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

exports.getAllData = async function () {
	try {
		var data = await pdfTemplateMaster.findAll({
			order: [['id', 'ASC']]
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

exports.getOneData = async function (id) {
	try {
		var data = await pdfTemplateMaster.findAll({
			where: { id: id }
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

exports.setDefault = async function (body) {
	const t = await sequelize.transaction();
	try {
		const template = await pdfTemplateMaster.findOne({ where: { id: body.id }, transaction: t });
		if (!template) {
			await t.rollback();
			responseCodes.BAD_REQUEST.data = null;
			responseCodes.BAD_REQUEST.message = "Template not found";
			return responseCodes.BAD_REQUEST;
		}
		await pdfTemplateMaster.update(
			{ is_default: false },
			{ where: { template_type: template.template_type }, transaction: t }
		);
		await pdfTemplateMaster.update(
			{ is_default: true },
			{ where: { id: body.id }, transaction: t }
		);
		await t.commit();
		responseCodes.SUCCESS.data = null;
		responseCodes.SUCCESS.message = "Default template updated successfully";
		return responseCodes.SUCCESS;
	} catch (e) {
		await t.rollback();
		responseCodes.BAD_REQUEST.data = e;
		responseCodes.BAD_REQUEST.message = "Failed to set default template";
		return responseCodes.BAD_REQUEST;
	}
};

exports.previewData = async function (body) {
	try {
		let htmlContent = body.html_content;
		let templateType = body.template_type;

		if (!htmlContent && body.id) {
			const template = await pdfTemplateMaster.findOne({ where: { id: body.id } });
			if (!template) {
				responseCodes.BAD_REQUEST.data = null;
				responseCodes.BAD_REQUEST.message = "Template not found";
				return responseCodes.BAD_REQUEST;
			}
			htmlContent = template.html_content;
			templateType = template.template_type;
		}

		const schema = TEMPLATE_SCHEMAS[templateType];
		const sampleData = schema ? schema.sampleData : {};
		const mergedHtml = mergeTemplate(htmlContent, sampleData);
		const pdfBuffer = await renderHtmlToPdfBuffer(mergedHtml);

		responseCodes.SUCCESS.data = { pdf_base64: pdfBuffer.toString("base64") };
		responseCodes.SUCCESS.message = "";
		return responseCodes.SUCCESS;
	} catch (e) {
		responseCodes.BAD_REQUEST.data = e;
		responseCodes.BAD_REQUEST.message = "Failed to render preview";
		return responseCodes.BAD_REQUEST;
	}
};
