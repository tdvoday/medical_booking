const express = require("express");
const router = express.Router();
const {
  getMyAppointments,
  markDone,
} = require("../controllers/doctorAppointmentController");
const { protectDoctor } = require("../middleware/authMiddleware");

router.use(protectDoctor);
router.get("/my", getMyAppointments);
router.put("/:id/done", markDone);

module.exports = router;
