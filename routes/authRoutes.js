const express = require('express');
const router = express.Router();
const controller = require('../controllers/appointmentController');
const auth = require('../middleware/verifytoken');
const Appointment = require('../models/appointmentmodels'); // ✅ FIX

router.get('/slots', controller.getAvailableSlots);
router.post('/book', auth, controller.bookAppointment);

router.get('/doctor/today', auth, controller.getDoctorTodayAppointments);

router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients allowed' });
    }

    const appointments = await Appointment.find({
      patientId: req.user.id,
    }).populate('doctorId');

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (err) {
    console.error('MY appointments error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;
