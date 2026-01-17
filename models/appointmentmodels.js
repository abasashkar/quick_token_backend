const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: String,      // "2026-01-18"
  slot: String,      // "11:30"
  tokenNumber: Number,

  status: {
    type: String,
    enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
    default: 'CONFIRMED'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

appointmentSchema.index({ doctorId: 1, date: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
