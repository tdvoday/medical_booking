const express = require("express");
const router = express.Router();
const {
  getAllAppointments,
  updateAppointmentStatus,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getStats,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect, adminOnly);
router.get("/stats", getStats);
router.get("/appointments", getAllAppointments);
router.put("/appointments/:id/status", updateAppointmentStatus);
router.post("/doctors", createDoctor);
router.put("/doctors/:id", updateDoctor);
router.delete("/doctors/:id", deleteDoctor);

module.exports = router;
