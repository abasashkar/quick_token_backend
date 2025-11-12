const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  patientName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  apptNo: { type: String, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Appointment", appointmentSchema);
