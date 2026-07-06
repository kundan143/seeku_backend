const { orgAddresses, countryMaster, stateMaster, cityMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");

const DETAIL_INCLUDES = [
	{ model: countryMaster },
	{ model: stateMaster },
	{ model: cityMaster },
];

exports.addData = async function (body) {
	try {
		var result = await orgAddresses.create(body.data);
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
		await orgAddresses.update(body.data, {
			where: { id: body.id }
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

// org_addresses has no soft-delete column (address_status is an active/inactive toggle, see updateStatus), so this is a hard delete
exports.deleteData = async function (body) {
	try {
		await orgAddresses.destroy({
			where: { id: body.id }
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

exports.updateStatus = async function (body) {
	try {
		await orgAddresses.update({ address_status: body.address_status }, {
			where: { id: body.id }
		});
		responseCodes.SUCCESS.data = null;
		responseCodes.SUCCESS.message = "Status Updated Successfully";
		return responseCodes.SUCCESS;
	} catch (e) {
		responseCodes.BAD_REQUEST.data = e;
		responseCodes.BAD_REQUEST.message = "Failed to Update Status";
		return responseCodes.BAD_REQUEST;
	}
};

exports.getAllData = async function () {
	try {
		var data = await orgAddresses.findAll({ order: [["id", "DESC"]] });
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
		var data = await orgAddresses.findAll({ where: { id } });
		responseCodes.SUCCESS.data = data;
		responseCodes.SUCCESS.message = "";
		return responseCodes.SUCCESS;
	} catch (e) {
		responseCodes.BAD_REQUEST.data = e;
		responseCodes.BAD_REQUEST.message = "Failed to Load Data";
		return responseCodes.BAD_REQUEST;
	}
};

// Same row as getOneData but joined with country/state/city, for a detail view
exports.getOneDetailData = async function (id) {
	try {
		var data = await orgAddresses.findAll({ where: { id }, include: DETAIL_INCLUDES });
		responseCodes.SUCCESS.data = data;
		responseCodes.SUCCESS.message = "";
		return responseCodes.SUCCESS;
	} catch (e) {
		responseCodes.BAD_REQUEST.data = e;
		responseCodes.BAD_REQUEST.message = "Failed to Load Data";
		return responseCodes.BAD_REQUEST;
	}
};

// Address book tab: every address for one organization, with country/state/city joined for display
exports.getAddressesAginstOneOrg = async function (org_id) {
	try {
		var data = await orgAddresses.findAll({
			where: { org_id },
			include: DETAIL_INCLUDES,
			order: [["id", "DESC"]]
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

// Autofill helper: reuse a previously entered address with the same postal code to suggest city/state/country
exports.getZipDetails = async function (postal_code) {
	try {
		var data = await orgAddresses.findAll({
			where: { postal_code },
			include: DETAIL_INCLUDES,
			limit: 1,
			order: [["id", "DESC"]]
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
