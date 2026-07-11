const OP_usersLeave = require("../../operations/OP_usersLeave");
const { canAccessUserRecord } = require("../../services/profileAccess");
const { responseCodes } = require("../../services/baseReponse");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.post('/getAllRows', async (req, res, next) => {
    return res.send(await OP_usersLeave.getAllData(req.body));
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_usersLeave.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_usersLeave.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_usersLeave.deleteData(req.body));
});

// 5 = Get One Row — id here is the target user's id (see OP_usersLeave.getOneData),
// so only the record owner or Employee Master view/edit access may fetch it
router.post('/getOneRow', async (req, res, next) => {
    if (!(await canAccessUserRecord(req.headers.userId, req.body.id))) {
        return res.send(responseCodes.FORBIDDEN);
    }
    return res.send(await OP_usersLeave.getOneData(req.body.id));
});

// 6 = Approval Update Row
router.post('/approvalUpdate', async (req, res, next) => {
    return res.send(await OP_usersLeave.approvalUpdateData(req.body));
});

module.exports = router;