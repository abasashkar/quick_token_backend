const mongoose = require('mongoose');

const doctorAvailabilitySchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  workingDays: {
    type: [String], // ["Mon","Tue","Wed"]
    required: true
  },
  startTime: String, // "10:00"
  endTime: String,   // "16:00"
  slotDuration: {
    type: Number, // minutes
    default: 15
  },
  breakStart: String, // "13:00"
  breakEnd: String,   // "14:00"
});

module.exports = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);