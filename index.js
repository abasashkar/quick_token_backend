require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const doctorsRoutes = require("./routes/doctorsRoutes");
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const patientRoutes = require("./routes/patientRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Flutter can reach backend!" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

app.listen(4000, () => {
  console.log("⚙️ Server running on port 4000");
});
