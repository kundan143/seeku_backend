const multer = require("multer");
const fs = require("fs");
const path = require("path");

const UPLOAD_ROOT = path.join(__dirname, "..", "public", "uploads");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
        cb(null, UPLOAD_ROOT);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
        cb(null, `${base}_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`);
    },
});

module.exports = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });
