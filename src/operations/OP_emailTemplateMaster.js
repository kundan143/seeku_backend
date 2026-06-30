const { emailTemplateMaster, departmentMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { Op } = require('sequelize');

exports.addData = async function (body) {
	try {
		var result = await emailTemplateMaster.create(body.data);
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
		await emailTemplateMaster.update(body.data, {
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
		await emailTemplateMaster.destroy({
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
		var data = await emailTemplateMaster.findAll({
			include: [
				{ model: departmentMaster, attributes: ['id', 'name'], required: false }
			],
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
		var data = await emailTemplateMaster.findAll({
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

exports.getTemplateByName = async function (name) {
	try {
		var data = await emailTemplateMaster.findAll({
			where: {
				template_name: { [Op.iLike]: `%${name}%` },
				is_active: 1
			},
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

exports.getTemplateByDepartment = async function (department_id) {
	try {
		var data = await emailTemplateMaster.findAll({
			where: {
				department_id: department_id,
				is_active: 1
			},
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

exports.copyTemplate = async function (body) {
	try {
		var source = await emailTemplateMaster.findOne({ where: { id: body.id } });
		if (!source) {
			responseCodes.BAD_REQUEST.data = null;
			responseCodes.BAD_REQUEST.message = "Source template not found";
			return responseCodes.BAD_REQUEST;
		}
		var newTemplate = await emailTemplateMaster.create({
			template_name: source.template_name + ' (Copy)',
			department_id: source.department_id,
			subject: source.subject,
			body: source.body,
			is_active: 1,
			created_by: body.created_by,
			created_date: body.created_date
		});
		responseCodes.SUCCESS.data = newTemplate.id;
		responseCodes.SUCCESS.message = "Template Copied Successfully";
		return responseCodes.SUCCESS;
	} catch (e) {
		responseCodes.BAD_REQUEST.data = e;
		responseCodes.BAD_REQUEST.message = "Failed to Copy Template";
		return responseCodes.BAD_REQUEST;
	}
};
