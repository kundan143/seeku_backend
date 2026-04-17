const { cableStageMaster, wireCableTypesMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require('sequelize');
// const { addActivityLog } = require("../services/activityLog");

exports.addData = async function (body) {
	try {
		var result = await cableStageMaster.create(body.data);
		responseCodes.SUCCESS.data = result.id;
		// addActivityLog(cableStageMaster.tableName, result.id, body, "ADD")
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
		await cableStageMaster.update(body.data, {
			where: {
				id: body.id
			}
		});
		responseCodes.SUCCESS.data = null;
		// addActivityLog(cableStageMaster.tableName, result.id, body, "UPDATE")
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
		await cableStageMaster.destroy({
			where: {
				id: body.id
			}
		});
		responseCodes.SUCCESS.data = null;
		// addActivityLog(cableStageMaster.tableName, result.id, body, "DELETE")
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
		var data = await cableStageMaster.findAll({
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
		var data = await cableStageMaster.findAll({
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

exports.getCableTypeStages = async function (wire_cable_type_id) {
	try {
		var data = await cableStageMaster.findAll({
			include: [{
				model: wireCableTypesMaster,
				attributes: ['description']
			}],
			where: {
				wire_cable_type_id: wire_cable_type_id
			},
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