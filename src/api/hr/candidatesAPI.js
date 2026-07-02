const OP_Candidates = require("../../operations/OP_Candidates");

const express = require('express');
const router = express.Router();

// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_Candidates.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_Candidates.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_Candidates.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_Candidates.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_Candidates.getOneData(req.body.id));
});

// 6 = Update Offer Status (draft/sent/accepted/rejected/withdrawn)
router.post('/updateStatus', async (req, res, next) => {
    return res.send(await OP_Candidates.updateStatus(req.body));
});

// 7 = Generate Offer Letter PDF and save URL
router.post('/generateOfferLetter', async (req, res, next) => {
    return res.send(await OP_Candidates.generateOfferLetter(req.body.id));
});

// 8 = Email Offer Letter to candidate
router.post('/emailOfferLetter', async (req, res, next) => {
    return res.send(await OP_Candidates.emailOfferLetter(req.body.id, req.body.emails || req.body.email));
});

// 9 = Bulk Email Offer Letters
router.post('/bulkEmailOfferLetters', async (req, res, next) => {
    return res.send(await OP_Candidates.bulkEmailOfferLetters(req.body.ids));
});

// 10 = Convert Candidate to Employee
router.post('/convertToEmployee', async (req, res, next) => {
    return res.send(await OP_Candidates.convertToEmployee(req.body));
});

module.exports = router;
