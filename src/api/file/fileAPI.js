const express = require('express');
const router = express.Router();
const multer = require("multer");
const upload = require("../../services/fileUploadService");
const { responseCodes } = require("../../services/baseReponse");

// 1 = Upload one or more files, returns their public path(s)
router.post('/upload', (req, res, next) => {
    upload.any()(req, res, (err) => {
        if (err instanceof multer.MulterError || err) {
            responseCodes.BAD_REQUEST.data = null;
            responseCodes.BAD_REQUEST.message = err.message || "Failed to Upload File";
            return res.send(responseCodes.BAD_REQUEST);
        }
        const files = req.files || [];
        if (!files.length) {
            responseCodes.BAD_REQUEST.data = null;
            responseCodes.BAD_REQUEST.message = "No file received";
            return res.send(responseCodes.BAD_REQUEST);
        }
        const paths = files.map(f => `/uploads/${f.filename}`);
        return res.send({
            code: '100',
            message: 'File Uploaded Successfully',
            path: paths[0],
            paths: paths,
        });
    });
});

module.exports = router;
