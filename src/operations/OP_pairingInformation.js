const { pairingInformation } = require("../models");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require('sequelize');

exports.addData = async function (body) {
    try {
        var result = await pairingInformation.create(body.data);
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
        await pairingInformation.update(body.data, {
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
        await pairingInformation.update(body.data, {
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
        var data = await pairingInformation.findAll({
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
        var data = await pairingInformation.findAll({
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
exports.getOneRowByDatasheet = async function (rel_so_id) {
    try {
        var data = await pairingInformation.findAll({
            where: {
                rel_so_id: rel_so_id,
                status: 1
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