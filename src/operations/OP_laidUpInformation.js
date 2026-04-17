const { laidUpInformation,productionDatasheet } = require("../models");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require('sequelize');
const { log } = require("winston");
const logger = require("../services/dailyLogService");

exports.addData = async function (body) {
    try {
        let stageUpdate = await productionDatasheet.update(
            { is_stage: 1 },
            {
                where: {
                id: body.data.pd_id,
                },
            },
        );
        if (stageUpdate[0] > 0) {
            var result = await laidUpInformation.create(body.data);
        }
        responseCodes.SUCCESS.data = result.id;
        responseCodes.SUCCESS.message = "Row Added Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        console.error("Error in addData:", e);
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Add Row";
        return responseCodes.BAD_REQUEST;
    }
};

exports.updateData = async function (body) {
    try {
        await laidUpInformation.update(body.data, {
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
        await laidUpInformation.update(body.data, {
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
        var data = await laidUpInformation.findAll({
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
        var data = await laidUpInformation.findAll({
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
        let query = `SELECT lui.*
        FROM laid_up_information lui
        WHERE lui.pd_id = ${pd_id} AND lui.status = 1`;

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