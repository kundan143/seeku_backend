const OP_ConductorInsulationDesign = require("../../operations/OP_ConductorInsulationDesign");
const OP_CableDesign = require("../../operations/OP_CableDesign");

const express = require('express');
const router = express.Router();

// 1 = Generate conductor + insulation design from basic inputs
router.post('/generate', async (req, res, next) => {
    return res.send(await OP_ConductorInsulationDesign.generate(req.body));
});

// 2 = Get All Saved Designs
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_CableDesign.getAllData());
});

// 3 = Save a Generated Design
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_CableDesign.addData(req.body));
});

// 4 = Update a Saved Design
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_CableDesign.updateData(req.body));
});

// 5 = Delete a Saved Design
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_CableDesign.deleteData(req.body));
});

// 6 = Get One Saved Design
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_CableDesign.getOneData(req.body.id));
});

module.exports = router;
