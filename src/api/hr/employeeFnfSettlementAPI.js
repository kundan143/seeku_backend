const OP_EmployeeFnfSettlement = require("../../operations/OP_EmployeeFnfSettlement");

const express = require("express");
const router = express.Router();

router.post('/getPreview', async (req, res, next) => {
    return res.send(await OP_EmployeeFnfSettlement.getFnfPreview(req.body));
});

router.post('/saveDraft', async (req, res, next) => {
    return res.send(await OP_EmployeeFnfSettlement.saveDraft(req.body));
});

router.post('/finalize', async (req, res, next) => {
    return res.send(await OP_EmployeeFnfSettlement.finalize(req.body));
});

router.post('/getByUser', async (req, res, next) => {
    return res.send(await OP_EmployeeFnfSettlement.getByUser(req.body.user_id));
});

module.exports = router;
