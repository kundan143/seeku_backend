const { dropdownMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require('sequelize');

exports.addData = async function (body) {
	try {
		var result = await dropdownMaster.create(body.data);
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
		await dropdownMaster.update(body.data, {
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
		await dropdownMaster.update({
			is_deleted: 1,
			deleted_by: body.deleted_by,
			deleted_date: body.deleted_date
		}, {
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
		let query = `SELECT dm.*, mm.menu_name
						FROM dropdown_master dm
						LEFT JOIN menu_master mm ON dm.menu_id = mm.id
						WHERE dm.is_deleted = 0
						ORDER BY dm.id ASC`;
		var data = await sequelize.query(query, { type: QueryTypes.SELECT });
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
		var data = await dropdownMaster.findAll({
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
