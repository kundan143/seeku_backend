const OP_ConductorInsulationDesign = require("../../operations/OP_ConductorInsulationDesign");

const express = require('express');
const router = express.Router();

// 1 = Generate conductor + insulation design from basic inputs
router.post('/generate', async (req, res, next) => {
    return res.send(await OP_ConductorInsulationDesign.generate(req.body));
});

module.exports = router;
