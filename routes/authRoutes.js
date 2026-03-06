const express = require("express");
const router = express.Router();
const authController = require("../controllers/authcontroller");
const { saveFcmToken } = require("../controllers/authcontroller");
const verifyToken = require("../middleware/verifytoken");


router.post("/register", authController.registerUser);
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/save-fcm-token", verifyToken, saveFcmToken);

module.exports = router;
