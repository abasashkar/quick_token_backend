// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/usermodels");
const Otp= require("../models/otpmodels");
const sendEmail=require("../utils/sendEmail")




const VALID_ROLES = ["patient", "doctor", "lab"];
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * sendOtp(req, res)
 * BODY: { email, role }
 * - If user exists and role mismatches => reject
 * - Otherwise create OTP record (delete previous) and email it
 */
exports.sendOtp = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ success: false, message: "Email and role are required." });
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role." });
    }

    // If user exists but with different role → reject (prevents same email for multiple roles)
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This email is already registered as '${existingUser.role}'. Use that login instead.`,
      });
    }

    // Delete any previous OTPs for this email+role
    await Otp.deleteMany({ email, role });

    const otp = generateOtp();
    await Otp.create({ email, role, otp });

    // Send OTP email (text body)
    await sendEmail(
      email,
      "Your OTP Code",
      `Your OTP code is ${otp}. It will expire in 5 minutes.`
    );

    return res.status(200).json({ success: true, message: "OTP sent successfully." });
  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(500).json({ success: false, message: "Failed to send OTP." });
  }
};

/**
 * verifyOtp(req, res)
 * BODY: { email, otp, role }
 * - Ensures OTP matches for given email+role
 * - Ensures role matches stored user role (if user exists)
 * - If user does not exist -> create user with provided role
 * - Return JWT with role included
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    if (!email || !otp || !role) {
      return res.status(400).json({ success: false, message: "Email, OTP and role are required." });
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role." });
    }

    // Find OTP record that matches email + role + otp
    const otpRecord = await Otp.findOne({ email, role, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    // Find user
    let user = await User.findOne({ email });

    // If user exists but with different role -> reject
    if (user && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This email is registered as '${user.role}', not '${role}'.`,
      });
    }

    // If no user exists -> create one with the requested role
    if (!user) {
      user = await User.create({ email, role, password: null });
    }

    // At this point -> allowed. Create JWT (include role)
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Optionally delete OTP now so it can't be reused
    await Otp.deleteMany({ email, role });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      token,
      role: user.role,
      email: user.email,
      id: user._id
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({ success: false, message: "OTP verification failed." });
  }
};

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



// const generateOtp=()=>Math.floor(100000+Math.random()*900000).toString();

// exports.sendOtp=async(req, res)=>{
//   try{
//     const{email}=req.body;
//     if(!email)throw new error("Email is required");
//     const otp=generateOtp();
//     await Otp.create({email,otp});

//     await sendEmail(
//       email,
//       "Your OTP code",
//       `Your OTP code is ${otp}.It will expire in 5 minutes.`
//     );
//     res.status(200).json({success:true,message:"OTP sent succuessfully!"});
    
//   }catch(error){
//     console.error(error);
//     res.status(500).json({success:false,message:"Failed to send otp" });

//   }
// };



// exports.verifyOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     console.log("Received data:", { email, otp }); // ✅ log incoming data

//     const validateOtp = await Otp.findOne({ email, otp });
//     console.log("OTP record found:", validateOtp); // ✅ log db result

//     if (!validateOtp) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired OTP",
//       });
//     }

//     let user = await User.findOne({ email });
//     if (!user) {
//       user = await User.create({ email, password: null });
//     }

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     res.status(200).json({
//       success: true,
//       message: "OTP verified successfully",
//       token,
//     });
//   } catch (error) {
//     console.error("❌ OTP verification error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Verification failed",
//     });
//   }
// };