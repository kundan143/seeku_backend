const { dropdownValueMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require('sequelize');

exports.addData = async function (body) {
	try {
		var result = await dropdownValueMaster.create(body.data);
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
		await dropdownValueMaster.update(body.data, {
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
		await dropdownValueMaster.update({
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
		let query = `SELECT dvm.*, dvm.id::int as id, dm.field_name, mm.menu_name, mm.id as menu_id
						FROM dropdown_value_master dvm
						JOIN dropdown_master dm ON dvm.field_id = dm.id
						JOIN menu_master mm ON dm.menu_id = mm.id
						WHERE dvm.is_deleted = 0
						ORDER BY dvm.id ASC`;
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
		var data = await dropdownValueMaster.findAll({
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

exports.getFieldDetails = async function (field_id) {
	try {
		let query = `SELECT dm.id as field_id, dm.field_name, mm.id as menu_id, mm.menu_name
						FROM dropdown_master dm
						JOIN menu_master mm ON dm.menu_id = mm.id
						WHERE dm.id = :field_id`;
		var data = await sequelize.query(query, { replacements: { field_id }, type: QueryTypes.SELECT });
		responseCodes.SUCCESS.data = data;
		responseCodes.SUCCESS.message = "";
		return responseCodes.SUCCESS;
	} catch (e) {
		responseCodes.BAD_REQUEST.data = e;
		responseCodes.BAD_REQUEST.message = "Failed to Load Data";
		return responseCodes.BAD_REQUEST;
	}
};

exports.getFieldValues = async function (field_id) {
	try {
		let query = `SELECT dvm.*, dvm.id::int as id, dm.field_name, mm.menu_name, mm.id as menu_id
						FROM dropdown_value_master dvm
						JOIN dropdown_master dm ON dvm.field_id = dm.id
						JOIN menu_master mm ON dm.menu_id = mm.id
						WHERE dvm.field_id = :field_id AND dvm.is_deleted = 0
						ORDER BY dvm.id ASC`;
		var data = await sequelize.query(query, { replacements: { field_id }, type: QueryTypes.SELECT });
		responseCodes.SUCCESS.data = data;
		responseCodes.SUCCESS.message = "";
		return responseCodes.SUCCESS;
	} catch (e) {
		responseCodes.BAD_REQUEST.data = e;
		responseCodes.BAD_REQUEST.message = "Failed to Load Data";
		return responseCodes.BAD_REQUEST;
	}
};
