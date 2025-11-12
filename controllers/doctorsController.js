const Doctor = require('../models/doctorsmodel');

exports.getAllDoctors = async (req, res) => {
  const query = req.query.search;

  try {
    let doctors;
    if (!query) {
      console.log("Not query");
      doctors = await Doctor.find(); 
    } else {
      console.log("query");
      doctors = await Doctor.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
        ],
      });
    }

    // ✅ Fix: Add base URL before image path
    const baseUrl = `${req.protocol}://${req.get('host')}/`;

    const updatedDoctors = doctors.map(doc => ({
      ...doc._doc,
      imageUrl: doc.imageUrl.startsWith('http')
        ? doc.imageUrl
        : `${baseUrl}${doc.imageUrl}`,
    }));

    res.status(200).json({ doctors: updatedDoctors });
  } catch (err) {
    console.error("Error fetching doctors:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

