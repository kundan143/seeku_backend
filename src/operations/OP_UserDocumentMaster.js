const { userDocumentMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes, Op } = require("sequelize");

exports.addData = async function (body) {
    const t = await sequelize.transaction();
    try {
        const existing = await userDocumentMaster.findOne({
            where: { user_id: body.data.user_id, doc_type: body.data.doc_type, status: 1 },
            transaction: t,
        });
        if (existing) {
            await t.rollback();
            responseCodes.BAD_REQUEST.data = null;
            responseCodes.BAD_REQUEST.message = "This employee already has a document of this type. Edit the existing one instead.";
            return responseCodes.BAD_REQUEST;
        }
        const result = await userDocumentMaster.create(body.data, { transaction: t });
        await t.commit();
        responseCodes.SUCCESS.data = result.id;
        responseCodes.SUCCESS.message = "Document Added Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        await t.rollback();
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Add Document";
        return responseCodes.BAD_REQUEST;
    }
};

exports.updateData = async function (body) {
    const t = await sequelize.transaction();
    try {
        if (body.data.user_id && body.data.doc_type) {
            const existing = await userDocumentMaster.findOne({
                where: {
                    id: { [Op.ne]: body.id },
                    user_id: body.data.user_id,
                    doc_type: body.data.doc_type,
                    status: 1,
                },
                transaction: t,
            });
            if (existing) {
                await t.rollback();
                responseCodes.BAD_REQUEST.data = null;
                responseCodes.BAD_REQUEST.message = "This employee already has a document of this type. Edit the existing one instead.";
                return responseCodes.BAD_REQUEST;
            }
        }
        await userDocumentMaster.update(body.data, { where: { id: body.id }, transaction: t });
        await t.commit();
        responseCodes.SUCCESS.data = null;
        responseCodes.SUCCESS.message = "Document Updated Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        await t.rollback();
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Update Document";
        return responseCodes.BAD_REQUEST;
    }
};

exports.deleteData = async function (body) {
    const t = await sequelize.transaction();
    try {
        await userDocumentMaster.update(body.data, { where: { id: body.id }, transaction: t });
        await t.commit();
        responseCodes.SUCCESS.data = null;
        responseCodes.SUCCESS.message = "Document Deleted Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        await t.rollback();
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Delete Document";
        return responseCodes.BAD_REQUEST;
    }
};

exports.getAllData = async function () {
    try {
        const query = `
            SELECT udm.*,
                   CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS user_name
            FROM user_document_master udm
            LEFT JOIN users_master um ON um.id = udm.user_id
            WHERE udm.status = 1
            ORDER BY udm.id DESC`;
        const data = await sequelize.query(query, { type: QueryTypes.SELECT });
        responseCodes.SUCCESS.data = data;
        responseCodes.SUCCESS.message = "";
        return responseCodes.SUCCESS;
    } catch (e) {
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Load Documents";
        return responseCodes.BAD_REQUEST;
    }
};

exports.getOneData = async function (id) {
    try {
        const query = `
            SELECT udm.*,
                   CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS user_name
            FROM user_document_master udm
            LEFT JOIN users_master um ON um.id = udm.user_id
            WHERE udm.id = :id AND udm.status = 1
            LIMIT 1`;
        const data = await sequelize.query(query, { replacements: { id }, type: QueryTypes.SELECT });
        if (data.length) {
            responseCodes.SUCCESS.data = data[0];
            responseCodes.SUCCESS.message = "";
            return responseCodes.SUCCESS;
        } else {
            responseCodes.NOT_FOUND.data = null;
            responseCodes.NOT_FOUND.message = "No Record Found";
            return responseCodes.NOT_FOUND;
        }
    } catch (e) {
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Load Document";
        return responseCodes.BAD_REQUEST;
    }
};

exports.getDataByUserId = async function (user_id) {
    try {
        const query = `
            SELECT udm.*
            FROM user_document_master udm
            WHERE udm.user_id = :user_id AND udm.status = 1
            ORDER BY udm.doc_type ASC, udm.id DESC`;
        const data = await sequelize.query(query, { replacements: { user_id }, type: QueryTypes.SELECT });
        responseCodes.SUCCESS.data = data;
        responseCodes.SUCCESS.message = "";
        return responseCodes.SUCCESS;
    } catch (e) {
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Load Documents";
        return responseCodes.BAD_REQUEST;
    }
};
