


// middleware/verifytoken.js
const jwt = require("jsonwebtoken");
const User = require("../models/usermodels");

const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ message: "You need an authorization token" });
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // attach user (includes role) to req
    req.user = user;
    next();
  } catch (err) {
    console.error("JWT error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;



