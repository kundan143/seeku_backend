const { innerSheathingInformation } = require("../models");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require('sequelize');
const { log } = require("winston");
const logger = require("../services/dailyLogService");

exports.addData = async function (body) {
    try {
        var result = await innerSheathingInformation.create(body.data);
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
        await innerSheathingInformation.update(body.data, {
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
        await innerSheathingInformation.update(body.data, {
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
        var data = await innerSheathingInformation.findAll({
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
        var data = await innerSheathingInformation.findAll({
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

exports.getOneRowByDatasheet = async function (pd_id) {
    try {
        let query = `select isi.*, mm.material_name  from inner_sheathing_information isi
                        join material_master mm on mm.id = isi.material_id
                        where isi.pd_id = ${pd_id} AND isi.status = 1`;

        const data = await sequelize.query(query, {
            type: QueryTypes.SELECT
        });
        responseCodes.SUCCESS.data = data;
        responseCodes.SUCCESS.message = "";
        return responseCodes.SUCCESS;
    } catch (e) {
        // logger.log("Error in getOneRowByDatasheet:", e);
        
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Load Data";
        return responseCodes.BAD_REQUEST;
    }
};