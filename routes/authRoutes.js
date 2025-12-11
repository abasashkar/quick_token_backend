// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUsername,
  sendOtp,
  verifyOtp,
} = require("../controllers/authcontroller"); // ✅ Make sure file name matches exactly (case-sensitive)

const verifyToken = require("../middleware/verifytoken"); // ✅ Ensure correct file name

// 🟢 Public routes (accessible without authentication)
router.post("/register", registerUser);    // Manual registration with role
router.post("/login", loginUser);          // Password-based login
router.post("/send-otp", sendOtp);         // Gmail OTP request
router.post("/verify-otp", verifyOtp);     // Gmail OTP verification

// 🔒 Protected route (requires valid token)
router.get("/getUsername", verifyToken, getUsername);

// ✅ Optional: You can add logout or refresh-token later
// router.post("/logout", logoutUser);

module.exports = router;
