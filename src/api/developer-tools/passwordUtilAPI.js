const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12;

// Generates a bcrypt hash for a plaintext password, e.g. for an admin to manually set/reset
// a password value in the database. Requires a valid JWT (see index.js mounting) since bcrypt
// hashing is deliberately CPU-slow and this has no legitimate anonymous use case.
router.post("/default_password", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return res.status(200).json({ success: true, hash });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
