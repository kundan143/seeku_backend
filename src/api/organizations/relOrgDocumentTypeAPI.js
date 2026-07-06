const OP_RelOrgDocumentType = require("../../operations/OP_RelOrgDocumentType");

const express = require('express');
const router = express.Router();


// 1 = Add Row
router.post('/addRow', async (req, res, next) => {
	return res.send(await OP_RelOrgDocumentType.addData(req.body));
});

// 2 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
	return res.send(await OP_RelOrgDocumentType.deleteData(req.body));
});

// 3 = Get Org Documents
router.post('/getOrgDocuments', async (req, res, next) => {
	return res.send(await OP_RelOrgDocumentType.getOrgDocuments(req.body.org_id));
});

// 4 = Get Org Documents (doc-type-wise detail)
router.post('/getOrgDocuments_docWise', async (req, res, next) => {
	return res.send(await OP_RelOrgDocumentType.getOrgDocuments_docWise(req.body.org_id));
});

// 5 = Get Supplier Credit Report
router.post('/getSupplierCreditReport', async (req, res, next) => {
	return res.send(await OP_RelOrgDocumentType.getSupplierCreditReport(req.body.org_id));
});

module.exports = router;
