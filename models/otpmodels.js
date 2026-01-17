


// models/Otp.js
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },


    role: {
      type: String,
      enum: ["patient", "doctor", "lab", "admin"],
      required: true
    },

    otp: {
      type: String,
      required: true
    },

    expiresAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

// auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);



// const mongoose = require("mongoose");

// const otpSchema = new mongoose.Schema({
//   email: { type: String, required: true },
//   role: { 
//     type: String,
//     enum: ["patient", "doctor", "lab"],
//     required: true
//   },
//   otp: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now, expires: 300 } // expires after 5 minutes
// });

// // Optionally create an index for faster lookups
// otpSchema.index({ email: 1, role: 1, otp: 1 });

// module.exports = mongoose.model("Otp", otpSchema);