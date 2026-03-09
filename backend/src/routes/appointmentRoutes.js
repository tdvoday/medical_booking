const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
} = require("../controllers/appointmentController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.post("/", createAppointment);
router.get("/my", getMyAppointments);
router.get("/:id", getAppointmentById);
router.put("/:id/cancel", cancelAppointment);

module.exports = router;
