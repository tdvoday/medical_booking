const express = require("express");
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  getAvailableSlots,
  getSpecialties,
} = require("../controllers/doctorController");

router.get("/", getDoctors);
router.get("/specialties", getSpecialties);
router.get("/:id", getDoctorById);
router.get("/:id/available-slots", getAvailableSlots);

module.exports = router;
