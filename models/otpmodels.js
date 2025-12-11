
// const mongoose = require("mongoose");
// const otpSchema = new mongoose.Schema({
//   email: { type: String, required: true },
//   otp: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now, expires: 300 } // 5 minutes expiry
// });
// module.exports = mongoose.model("Otp", otpSchema);


// models/otpmodels.js
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  role: { 
    type: String,
    enum: ["patient", "doctor", "lab"],
    required: true
  },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // expires after 5 minutes
});

// Optionally create an index for faster lookups
otpSchema.index({ email: 1, role: 1, otp: 1 });

module.exports = mongoose.model("Otp", otpSchema);
