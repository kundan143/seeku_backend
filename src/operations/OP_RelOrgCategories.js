const { relOrgCategories, orgCategoriesMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require('sequelize');

exports.addData = async function (body) {
	try {
		var result = await relOrgCategories.create(body.data);
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
		await relOrgCategories.update(body.data, {
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
		await relOrgCategories.destroy({
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
		var data = await relOrgCategories.findAll({
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
		var data = await relOrgCategories.findAll({
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

exports.getOrgCategories = async function (org_id) {
	try {
		var query = `SELECT roc.*, ocm.category_type 
		FROM rel_org_categories AS roc 
		JOIN org_categories_master AS ocm ON ocm.id = roc.org_cat_id 
		WHERE roc.org_id = `+ org_id + ` 
		GROUP BY roc.id, ocm.category_type;`;
		const data = await sequelize.query(query, {
			type: QueryTypes.SELECT
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
exports.getOrgSubCategories = async function (org_id) {
	try {
		var query = `SELECT rsoc.*, 
			(
				CASE
					WHEN (rsoc.org_sub_cat_id = 1) THEN 'Manufacturer'
					WHEN (rsoc.org_sub_cat_id = 2) THEN 'Trader'
					ELSE '-'
				END
			) AS sub_Category
                FROM rel_sub_org_categories AS rsoc
                join rel_org_categories roc on roc.org_id = rsoc.org_id
                JOIN org_categories_master AS ocm ON ocm.id = roc.org_cat_id  
		WHERE roc.org_id = `+ org_id + ` 
		GROUP BY rsoc.id,rsoc.org_id, ocm.category_type,rsoc.org_sub_cat_id;`;
		const data = await sequelize.query(query, {
			type: QueryTypes.SELECT
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
