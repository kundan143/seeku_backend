const OP_MedicalInsurance = require("../../operations/OP_MedicalInsurance");
const { canAccessUserRecord } = require("../../services/profileAccess");
const { responseCodes } = require("../../services/baseReponse");

const express = require("express");
const router = express.Router();

// 1 = Get All Rows (admin-wide list)
router.get("/getAllRows", async (req, res, next) => {
    return res.send(await OP_MedicalInsurance.getAllData());
});

// 2 = Add Row
router.post("/addRow", async (req, res, next) => {
    return res.send(await OP_MedicalInsurance.addData(req.body));
});

// 3 = Update Row
router.post("/updateRow", async (req, res, next) => {
    return res.send(await OP_MedicalInsurance.updateData(req.body));
});

// 4 = Delete Row
router.post("/deleteRow", async (req, res, next) => {
    return res.send(await OP_MedicalInsurance.deleteData(req.body));
});

// 5 = Get One Row — id here is the target employee's id, so only the
// record owner or Employee Master view/edit access may fetch it
router.post("/getOneRow", async (req, res, next) => {
    if (!(await canAccessUserRecord(req.headers.userId, req.body.id))) {
        return res.send(responseCodes.FORBIDDEN);
    }
    return res.send(await OP_MedicalInsurance.getOneData(req.body.id));
});

module.exports = router;
