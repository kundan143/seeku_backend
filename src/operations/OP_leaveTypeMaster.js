const { leaveTypeMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require('sequelize');

exports.addData = async function (body) {
    try {
        var result = await leaveTypeMaster.create(body.data);
        responseCodes.SUCCESS.data = result.id;
        responseCodes.SUCCESS.message = "Leave type Added Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Add Leave Type";
        return responseCodes.BAD_REQUEST;
    }
};

exports.updateData = async function (body) {
    try {
        await leaveTypeMaster.update(body.data, {
            where: {
                id: body.id
            }
        });
        responseCodes.SUCCESS.data = null;
        responseCodes.SUCCESS.message = "Leave Type Updated Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Update Leave Type";
        return responseCodes.BAD_REQUEST;
    }
};

exports.deleteData = async function (body) {
    try {
        await leaveTypeMaster.update(body.data, {
            where: {
                id: body.id
            }
        });
        responseCodes.SUCCESS.data = null;
        responseCodes.SUCCESS.message = "Leave Type Deleted Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Delete Leave Type";
        return responseCodes.BAD_REQUEST;
    }
};

exports.getAllData = async function () {
    try {
        var data = await leaveTypeMaster.findAll({
             where: {
                status: 1
            },
            order: [
                ['id', 'ASC']
            ]
        });
        responseCodes.SUCCESS.data = data;
        responseCodes.SUCCESS.message = "Leave Types Loaded Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Load Leave Types";
        return responseCodes.BAD_REQUEST;
    }
};

exports.getOneData = async function (id) {
    try {
        var data = await leaveTypeMaster.findAll({
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