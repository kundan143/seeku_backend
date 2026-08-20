const { roleMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require('sequelize');

// Only an existing Super Admin can grant/keep the Super Admin flag on a role - checked here
// server-side (not just hidden in the UI) so a crafted request can't self-promote a role by
// posting is_super_admin: true directly.
async function isRequesterSuperAdmin(requesterId) {
	if (!requesterId) return false;
	const rows = await sequelize.query(
		`SELECT 1 FROM users_master um
		 JOIN role_master rm ON rm.id = um.role_id
		 WHERE um.id = :requesterId AND rm.is_super_admin = TRUE
		 LIMIT 1`,
		{ type: QueryTypes.SELECT, replacements: { requesterId } }
	);
	return rows.length > 0;
}

exports.addData = async function (body, requesterId) {
	try {
		const data = { ...body.data };
		if (!(await isRequesterSuperAdmin(requesterId))) {
			delete data.is_super_admin;
		}
		var result = await roleMaster.create(data);
		responseCodes.SUCCESS.data = result.id;
		responseCodes.SUCCESS.message = "Row Added Successfully";
		return responseCodes.SUCCESS;
	} catch (e) {
		responseCodes.BAD_REQUEST.data = e;
		responseCodes.BAD_REQUEST.message = "Failed to Add Row";
		return responseCodes.BAD_REQUEST;
	}
};

exports.updateData = async function (body, requesterId) {
	try {
		const data = { ...body.data };
		if (!(await isRequesterSuperAdmin(requesterId))) {
			delete data.is_super_admin;
		}
		await roleMaster.update(data, {
			where: {
				id: body.id
			}
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
		await roleMaster.destroy({
			where: {
				id: body.id
			}
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
		var data = await roleMaster.findAll({
			order: [
				['id', 'ASC']
			]
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
		var data = await roleMaster.findAll({
			where: {
				id: id
			}
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