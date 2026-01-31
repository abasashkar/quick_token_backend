const Doctor = require('../models/doctorsmodel');



exports.getAllDoctors = async (req, res) => {
  const query = req.query.search;

  let doctors = query
    ? await Doctor.find({ name: { $regex: query, $options: "i" } })
    : await Doctor.find();

  res.status(200).json({ doctors });
};

exports.updateDoctorProfile = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can update profile" });
    }

    const { specialization, location } = req.body;

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.id },
      { specialization, location },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      doctor
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
