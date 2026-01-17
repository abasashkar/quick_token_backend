require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const ApiError = require("./utils/apiError.utils");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const doctorRoutes = require("./routes/doctorsRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);


const appointmentroutes = require("./routes/appointmentRoutes");
app.use("/api/appointments", appointmentroutes);







// Test route
app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Flutter can reach backend!",
    data: null,
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// Global error handler (must be after all routes)
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
      errors: err.errors || [],
    });
  }

  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    data: null,
    errors: [err.message || "Internal Server Error"],
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`⚙️ Server running on port ${PORT}`);
});
