const { menuMaster, menuPermission } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require('sequelize');


exports.addData = async function (body) {
	try {
		let result = await menuMaster.create(body.data);

		let userQuery = `SELECT * FROM users_master AS um WHERE role_id IN (1) AND account_block = FALSE;`;
		let userData = await sequelize.query(userQuery, {
			type: QueryTypes.SELECT
		});

		let menu_permissions_arr = [];

		userData.forEach(userElement => {
			menu_permissions_arr.push({
				designation_id: 1,
				menu_id: result.id,
				add_opt: 1,
				edit_opt: 1,
				view_opt: 1,
				delete_opt: 1,
				user_id: userElement.id,
				is_active: 1,
				created_by: userElement.created_by,
				created_date: userElement.created_date,
			})
		});

		await menuPermission.bulkCreate(menu_permissions_arr);

		// addActivityLog(menuPermission.tableName, result.id, body, "ADD");
		responseCodes.SUCCESS.data = null;
		responseCodes.SUCCESS.message = "Row Added Successfully";
		return responseCodes.SUCCESS;
	} catch (e) {
		console.log(e, "ERROR");
		responseCodes.BAD_REQUEST.data = e;
		responseCodes.BAD_REQUEST.message = "Failed to Add Row";
		return responseCodes.BAD_REQUEST;
	}
};

exports.updateData = async function (body) {
	try {
		await menuMaster.update(body.data, {
			where: {
				id: body.id
			}
		});
		// addActivityLog(menuMaster.tableName, body.id, body, "ADD");
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
		await menuPermission.destroy({
			where: {
				menu_id: body.id
			}
		});
		await menuMaster.destroy({
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
		var query = `SELECT cm.*, 
		(
			CASE 
			WHEN pm.icon IS NULL THEN cm.icon 
			ELSE pm.icon 
			END
		) AS parent_icon, 
		(
			CASE 
			WHEN pm.menu_name IS NULL THEN cm.menu_name 
			ELSE pm.menu_name 
			END
		) AS parent_menu 
		FROM menu_master AS cm 
		LEFT JOIN menu_master AS pm ON pm.id = cm.parent_id 
		GROUP BY cm.id, pm.menu_name, pm.icon
		ORDER BY cm.id;`;
		var data = await sequelize.query(query, {
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

exports.getOneData = async function (id) {
	try {
		var data = await menuMaster.findAll({
			where: {
				id: id
			}
		});
		responseCodes.SUCCESS.data = data;
		responseCodes.SUCCESS.message = "";
		return responseCodes.SUCCESS;
	} catch (e) {
		console.log(e);
		responseCodes.BAD_REQUEST.data = e;
		responseCodes.BAD_REQUEST.message = "Failed to Load Data";
		return responseCodes.BAD_REQUEST;
	}
};

exports.getParentMenus = async function (id) {
	try {
		var data = await menuMaster.findAll({
			where: {
				parent_id: null
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