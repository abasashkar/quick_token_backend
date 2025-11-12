// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUsername, sendOtp, verifyOtp } = require("../controllers/authcontroller");
const verifyToken = require("../middleware/verifytoken");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route
router.get("/getUsername", verifyToken, getUsername);
router.post("/send-otp",sendOtp);
router.post("/verify-otp",verifyOtp);



module.exports = router;
