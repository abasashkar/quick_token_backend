const express = require('express');
const router = express.Router();

const Appointment = require('../models/appointmentmodels'); // 🔥 ADD THIS
const controller = require('../controllers/appointmentController');
const auth = require('../middleware/verifytoken');


router.get('/slots', controller.getAvailableSlots);
router.post('/book', auth, controller.bookAppointment);
router.get(
  '/doctor/today',
  auth,
  controller.getDoctorTodayAppointments
);
router.get('/my', auth, async (req, res) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ message: 'Only patients allowed' });
  }

  const appointments = await Appointment.find({
    patientId: req.user.id
  }).populate('doctorId');

  res.json({ appointments });
});


router.patch(
  '/:appointmentId/status',
  auth,
  controller.updateAppointmentStatus
);


module.exports = router;
