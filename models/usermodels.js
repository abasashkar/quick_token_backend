





// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    role: {
      type: String,
      enum: ["patient", "doctor", "lab", "admin"],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);


