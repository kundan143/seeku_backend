const OP_emailTemplateMaster = require("../../operations/OP_emailTemplateMaster");

const express = require("express");
const router = express.Router();

// 1 = Get All Rows
router.get("/getAllRows", async (req, res, next) => {
	return res.send(await OP_emailTemplateMaster.getAllData());
});

// 2 = Add Row
router.post("/addRow", async (req, res, next) => {
	return res.send(await OP_emailTemplateMaster.addData(req.body));
});

// 3 = Update Row
router.post("/updateRow", async (req, res, next) => {
	return res.send(await OP_emailTemplateMaster.updateData(req.body));
});

// 4 = Delete Row
router.post("/deleteRow", async (req, res, next) => {
	return res.send(await OP_emailTemplateMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post("/getOneRow", async (req, res, next) => {
	return res.send(await OP_emailTemplateMaster.getOneData(req.body.id));
});

// 6 = Get Template By Name
router.post("/getTemplateByName", async (req, res, next) => {
	return res.send(await OP_emailTemplateMaster.getTemplateByName(req.body.name));
});

// 7 = Get Template By Department
router.post("/getTemplateByDepartment", async (req, res, next) => {
	return res.send(await OP_emailTemplateMaster.getTemplateByDepartment(req.body.department_id));
});

// 8 = Copy Template
router.post("/copyTemplate", async (req, res, next) => {
	return res.send(await OP_emailTemplateMaster.copyTemplate(req.body));
});

module.exports = router;
