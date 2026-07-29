const OP_PdfTemplateMaster = require("../../operations/OP_PdfTemplateMaster");

const express = require("express");
const router = express.Router();

// 1 = Get All Rows
router.get("/getAllRows", async (req, res, next) => {
	return res.send(await OP_PdfTemplateMaster.getAllData());
});

// 2 = Add Row
router.post("/addRow", async (req, res, next) => {
	return res.send(await OP_PdfTemplateMaster.addData(req.body));
});

// 3 = Update Row
router.post("/updateRow", async (req, res, next) => {
	return res.send(await OP_PdfTemplateMaster.updateData(req.body));
});

// 4 = Delete Row
router.post("/deleteRow", async (req, res, next) => {
	return res.send(await OP_PdfTemplateMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post("/getOneRow", async (req, res, next) => {
	return res.send(await OP_PdfTemplateMaster.getOneData(req.body.id));
});

// 6 = Set Default
router.post("/setDefault", async (req, res, next) => {
	return res.send(await OP_PdfTemplateMaster.setDefault(req.body));
});

// 7 = Preview
router.post("/previewRow", async (req, res, next) => {
	return res.send(await OP_PdfTemplateMaster.previewData(req.body));
});

module.exports = router;
