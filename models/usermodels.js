

// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },

//   role: {
//     type: String,
//     enum: ["patient", "doctor", "lab"],
//     required: true,
//   },

//   password: { type: String, default: null }

// }, { timestamps: true });

// module.exports = mongoose.model("User", userSchema);



// models/usermodels.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ["patient", "doctor", "lab"],
    required: true,
  },
  password: { type: String, default: null } // keep for future use
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
