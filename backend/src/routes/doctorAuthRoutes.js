const express = require("express");
const router = express.Router();
const { loginDoctor, getMe } = require("../controllers/doctorAuthController");
const { protectDoctor } = require("../middleware/authMiddleware");

router.post("/login", loginDoctor);
router.get("/me", protectDoctor, getMe);

module.exports = router;
