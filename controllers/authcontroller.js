const jwt = require("jsonwebtoken");
const User = require("../models/usermodels");
const Otp = require("../models/otpmodels");
const Doctor = require("../models/doctorsmodel");
const sendEmail = require("../utils/sendEmail");
const ApiResponse = require("../utils/apiResponse.utils");
const ApiError = require("../utils/apiError.utils");

const VALID_ROLES = ["patient", "doctor", "lab", "admin"];

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * REGISTER USER
 */
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) throw new ApiError(400, "Name, email, and role are required");
    if (!VALID_ROLES.includes(role)) throw new ApiError(400, "Invalid role");

    const exists = await User.findOne({ email });
    if (exists) throw new ApiError(409, "User already exists");

    const user = await User.create({ name, email, role });

    if (role === "doctor") {
      await Doctor.create({ userId: user._id, name, location: "", ratings: 0, reviews: "", imageUrl: "" });
    }

    res.status(201).json(new ApiResponse(201, { name, email, role }, "Registered successfully"));
  } catch (err) {
    next(err);
  }
};

/**
 * SEND OTP
 */
exports.sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "Email required");

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not registered");

    const otp = generateOtp();

    await Otp.deleteMany({ email });
    await Otp.create({ email, role: user.role, otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
    await sendEmail(email, "Your Login OTP", `Your OTP is ${otp}. Valid for 5 minutes`);

    res.json(new ApiResponse(200, { role: user.role }, "OTP sent successfully"));
  } catch (err) {
    next(err);
  }
};

/**
 * VERIFY OTP
 */
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) throw new ApiError(400, "Email & OTP required");

    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord || otpRecord.expiresAt < new Date()) throw new ApiError(400, "Invalid or expired OTP");

    const user = await User.findOne({ email });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await Otp.deleteMany({ email });

    res.json(new ApiResponse(200, { token, role: user.role, email: user.email, name: user.name, }, "Login successful"));
  } catch (err) {
    next(err);
  }
};


