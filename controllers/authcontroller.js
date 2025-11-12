// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/usermodels");
const Otp= require("../models/otpmodels");
const sendEmail=require("../utils/sendEmail")




exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      throw new Error("Please fill all the fields.");

    const existingUser = await User.findOne({ email });
    if (existingUser)
      throw new Error("User already exists!");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ email: newUser.email, token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      throw new Error("Please fill all the fields.");

    const user = await User.findOne({ email });
    if (!user)
      throw new Error("Account does not exist.");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new Error("Incorrect email or password.");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ email: user.email, token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.getUsername = async (req, res) => {
  try {
    res.status(200).json({ email: req.user.email });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



const generateOtp=()=>Math.floor(100000+Math.random()*900000).toString();

exports.sendOtp=async(req, res)=>{
  try{
    const{email}=req.body;
    if(!email)throw new error("Email is required");
    const otp=generateOtp();
    await Otp.create({email,otp});

    await sendEmail(
      email,
      "Your OTP code",
      `Your OTP code is ${otp}.It will expire in 5 minutes.`
    );
    res.status(200).json({success:true,message:"OTP sent succuessfully!"});
    
  }catch(error){
    console.error(error);
    res.status(500).json({success:false,message:"Failed to send otp" });

  }
};



exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("Received data:", { email, otp }); // ✅ log incoming data

    const validateOtp = await Otp.findOne({ email, otp });
    console.log("OTP record found:", validateOtp); // ✅ log db result

    if (!validateOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, password: null });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
    });
  } catch (error) {
    console.error("❌ OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Verification failed",
    });
  }
};
