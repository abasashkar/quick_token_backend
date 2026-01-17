const Doctor = require('../models/doctorsmodel');



exports.getAllDoctors = async (req, res) => {
  const query = req.query.search;

  let doctors = query
    ? await Doctor.find({ name: { $regex: query, $options: "i" } })
    : await Doctor.find();

  res.status(200).json({ doctors });
};


