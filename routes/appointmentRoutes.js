const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAppointmentsByDoctor,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

router.post("/", createAppointment);
router.get("/:doctorId", getAppointmentsByDoctor);
router.put("/:id/status", updateAppointmentStatus); // ✅ ADD THIS LINE

module.exports = router;
