const OP_RolePermission = require("../../operations/OP_RolePermission");
const express = require('express');
const router = express.Router();

router.post('/getPermissions', async (req, res, next) => {
    return res.send(await OP_RolePermission.getPermissions(req.body));
});

router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_RolePermission.addData(req.body));
});

// Retroactively resets every active user on this role to its current defaults
router.post('/syncUsers', async (req, res, next) => {
    return res.send(await OP_RolePermission.syncUsersToRole(req.body));
});

module.exports = router;
