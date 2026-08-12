const { cableDesign } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

exports.addData = async function (body) {
    const t = await sequelize.transaction();
    try {
        const result = await cableDesign.create(body.data, { transaction: t });
        await t.commit();
        responseCodes.SUCCESS.data = result.id;
        responseCodes.SUCCESS.message = "Design Saved Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        await t.rollback();
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Save Design";
        return responseCodes.BAD_REQUEST;
    }
};

exports.updateData = async function (body) {
    const t = await sequelize.transaction();
    try {
        await cableDesign.update(body.data, { where: { id: body.id }, transaction: t });
        await t.commit();
        responseCodes.SUCCESS.data = null;
        responseCodes.SUCCESS.message = "Design Updated Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        await t.rollback();
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Update Design";
        return responseCodes.BAD_REQUEST;
    }
};

exports.deleteData = async function (body) {
    const t = await sequelize.transaction();
    try {
        await cableDesign.update(body.data, { where: { id: body.id }, transaction: t });
        await t.commit();
        responseCodes.SUCCESS.data = null;
        responseCodes.SUCCESS.message = "Design Deleted Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        await t.rollback();
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Delete Design";
        return responseCodes.BAD_REQUEST;
    }
};

exports.getAllData = async function () {
    try {
        const query = `
            SELECT cd.*, CONCAT(um.first_name, ' ', um.last_name) AS created_by_name
            FROM cable_design cd
            LEFT JOIN users_master um ON um.id = cd.created_by
            WHERE cd.status = 1
            ORDER BY cd.id DESC`;
        const data = await sequelize.query(query, { type: QueryTypes.SELECT });
        responseCodes.SUCCESS.data = data;
        responseCodes.SUCCESS.message = "";
        return responseCodes.SUCCESS;
    } catch (e) {
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Load Designs";
        return responseCodes.BAD_REQUEST;
    }
};

exports.getOneData = async function (id) {
    try {
        const data = await cableDesign.findOne({ where: { id, status: 1 } });
        if (data) {
            responseCodes.SUCCESS.data = data;
            responseCodes.SUCCESS.message = "";
            return responseCodes.SUCCESS;
        } else {
            responseCodes.NOT_FOUND.data = null;
            responseCodes.NOT_FOUND.message = "No Record Found";
            return responseCodes.NOT_FOUND;
        }
    } catch (e) {
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Load Design";
        return responseCodes.BAD_REQUEST;
    }
};
