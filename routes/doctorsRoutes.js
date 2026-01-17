const express = require("express");
const router = express.Router();
const Doctor = require("../models/doctorsmodel");
const DoctorAvailability = require("../models/doctorAvailablity");
const verifyToken = require("../middleware/verifytoken");

// 🔹 Logged-in doctor profile



// 🔹 Get all doctors (for patients)
router.get("/", async (req, res) => {
  const doctors = await Doctor.find();
  res.status(200).json({ doctors });
});

// 🔹 SET DOCTOR AVAILABILITY ✅ (THIS WAS MISSING)
router.post("/availability", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can set availability" });
    }

    // 🔑 Convert USER → DOCTOR
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const availability = await DoctorAvailability.findOneAndUpdate(
      { doctorId: doctor._id },           // ✅ Doctor._id
      { ...req.body, doctorId: doctor._id },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: "Availability saved",
      availability,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;









