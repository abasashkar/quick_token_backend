const Appointment = require('../models/appointmentmodels');
const DoctorAvailability = require('../models/doctorAvailablity');
const generateSlots = require('../utils/slotGenerator');
const Doctor = require('../models/doctorsmodel');
const sendNotification = require("../utils/sendNotification");
const User = require("../models/usermodels");
const mongoose = require('mongoose');


/**
 * ================================
 * GET AVAILABLE SLOTS (PATIENT)
 * ================================
 */
exports.getAvailableSlots = async (req, res) => {
  try {
    console.log('===== GET AVAILABLE SLOTS =====');
    console.log('Query:', req.query);

    const { doctorId, date } = req.query;

    // 1️⃣ Validation
    if (!doctorId || !date) {
      console.log('❌ Missing doctorId or date');
      return res.status(400).json({
        message: 'doctorId and date are required',
      });
    }

    // 2️⃣ Check Doctor exists
    console.log('Finding Doctor by ID:', doctorId);
    const doctor = await Doctor.findById(doctorId);
    console.log('Doctor found:', doctor);

    if (!doctor) {
      console.log('❌ Doctor NOT found in doctors collection');
      return res.status(404).json({
        message: 'Doctor not found',
      });
    }

    // 3️⃣ Check Availability
    console.log('Finding availability for doctorId:', doctor._id);
    const availability = await DoctorAvailability.findOne({
      doctorId: doctor._id,
    });
    console.log('Availability found:', availability);

    if (!availability) {
      console.log('❌ Availability NOT set for this doctor');
      return res.status(404).json({
        message: 'Availability not set',
      });
    }

    // 4️⃣ Working day check
    const day = new Date(date).toLocaleString('en-US', {
      weekday: 'short',
    });
    console.log('Requested day:', day);
    console.log('Doctor working days:', availability.workingDays);

    if (!availability.workingDays.includes(day)) {
      console.log('⚠️ Doctor not working on this day');
      return res.status(200).json({
        doctorId,
        date,
        availableSlots: [],
      });
    }

    // 5️⃣ Generate slots
    const allSlots = generateSlots(
      availability.startTime,
      availability.endTime,
      availability.slotDuration,
      availability.breakStart,
      availability.breakEnd
    );

    console.log('All generated slots:', allSlots);

    // 6️⃣ Booked slots
const bookedSlots = await Appointment.find({
  doctorId: doctor._id,
  date,
  status: { $in: ['PENDING', 'CONFIRMED'] },
}).distinct('slot');

    console.log('Booked slots:', bookedSlots);

    // 7️⃣ Available slots
    const availableSlots = allSlots.filter(
      slot => !bookedSlots.includes(slot)
    );

    console.log('Available slots:', availableSlots);

    return res.status(200).json({
      doctorId,
      date,
      availableSlots,
    });
  } catch (err) {
    console.error('🔥 getAvailableSlots error:', err);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};

/**
 * ================================
 * BOOK APPOINTMENT (PATIENT)
 * ================================
 */


exports.bookAppointment = async (req, res) => {
  try {
    console.log('=== Book Appointment Request ===');
    console.log('User:', req.user);
    console.log('Body:', req.body);

    if (req.user.role !== 'patient') {
      return res.status(403).json({
        message: 'Only patients can book appointments',
      });
    }

    // ✅ DEFINE FIRST
    const { doctorId, date, slot } = req.body;

    // ✅ NOW you can validate
    if (!doctorId || !date || !slot) {
      return res.status(400).json({
        message: 'doctorId, date and slot are required',
      });
    }

    // ✅ ObjectId validation (CORRECT PLACE)
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        message: 'Invalid doctorId format',
      });
    }

    console.log('Incoming doctorId:', doctorId);

    // ✅ Find doctor
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found',
      });
    }

    // 🔍 Debug mapping
    console.log('Resolved Doctor _id:', doctor._id.toString());
    console.log('Doctor.userId:', doctor.userId.toString());

    // ✅ Slot check
    const slotAlreadyBooked = await Appointment.findOne({
      doctorId: doctor._id,
      date,
      slot,
      status: { $in: ['PENDING', 'CONFIRMED'] },
    });

    if (slotAlreadyBooked) {
      return res.status(409).json({
        message: 'Slot already booked',
      });
    }

    // ✅ Create appointment
    const appointment = await Appointment.create({
      doctorId: doctor._id,
      patientId: req.user._id,
      date,
      slot,
      status: 'PENDING',
      tokenNumber: null,
    });

    // ✅ Notify doctor
// ✅ Notify doctor (NON-BLOCKING)
const doctorUser = await User.findById(doctor.userId);

try {
  if (doctorUser?.fcmToken) {
    await sendNotification({
      token: doctorUser.fcmToken,
      title: 'New Appointment Request 🩺',
      body: `New appointment on ${date} at ${slot}`,
      data: {
        appointmentId: appointment._id.toString(),
        type: 'NEW_APPOINTMENT',
      },
    });
  }
} catch (err) {
  console.warn(
    '⚠️ FCM failed but booking succeeded:',
    err.message
  );
}

    console.log('Appointment status:', appointment.status);

    return res.status(201).json({
      success: true,
      appointment,
    });
  } catch (err) {
    console.error('bookAppointment error:', err);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};

exports.getDoctorPendingAppointments = async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const doctor = await Doctor.findOne({ userId: req.user._id
 });
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const appointments = await Appointment.find({
    doctorId: doctor._id,
    status: 'PENDING',
  })
    .populate('patientId', 'name')
    .sort({ createdAt: 1 });

  res.json({ success: true, appointments });
};

exports.acceptAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // 🔑 Find doctor from logged-in user
    const doctor = await Doctor.findOne({ userId: req.user._id
 });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // 🔐 Fetch appointment AND verify ownership
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id,
    });

    if (!appointment || appointment.status !== 'PENDING') {
      return res.status(400).json({ message: 'Invalid appointment' });
    }

    const tokenNumber =
      (await Appointment.countDocuments({
        doctorId: doctor._id,
        date: appointment.date,
        status: 'CONFIRMED',
      })) + 1;

    appointment.status = 'CONFIRMED';
    appointment.tokenNumber = tokenNumber;
    await appointment.save();
    // 🔔 Notify patient: appointment confirmed
const patientUser = await User.findById(appointment.patientId);

if (patientUser?.fcmToken) {
  await sendNotification({
    token: patientUser.fcmToken,
    title: "Appointment Confirmed ✅",
    body: `Your appointment on ${appointment.date} at ${appointment.slot} is confirmed`,
    data: {
      appointmentId: appointment._id.toString(),
      type: "APPOINTMENT_CONFIRMED",
    },
  });
}




    return res.json({
      success: true,
      appointment,
    });
  } catch (err) {
    console.error('acceptAppointment error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied' });
  }
const doctor = await Doctor.findOne({ userId: req.user._id });
if (!doctor) {
  return res.status(404).json({ message: 'Doctor not found' });
}

const appointment = await Appointment.findOne({
  _id: appointmentId,
  doctorId: doctor._id
});

if (!appointment) {
  return res.status(404).json({ message: 'Appointment not found' });
}


  appointment.status = 'CANCELLED';
  await appointment.save();

  // 🔔 Notify patient: appointment rejected
const patientUser = await User.findById(appointment.patientId);

if (patientUser?.fcmToken) {
  await sendNotification({
    token: patientUser.fcmToken,
    title: "Appointment Rejected ❌",
    body: "Doctor is unavailable for the selected slot",
    data: {
      appointmentId: appointment._id.toString(),
      type: "APPOINTMENT_REJECTED",
    },
  });
}


  res.json({ success: true, appointment });
};

/**
 * ================================
 * DOCTOR TODAY APPOINTMENTS
 * ================================
 */
exports.getDoctorConfirmedAppointments = async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const doctor = await Doctor.findOne({ userId: req.user._id
 });
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const appointments = await Appointment.find({
    doctorId: doctor._id,
    status: 'CONFIRMED',
  }).sort({ date: 1, slot: 1 });

  res.json({
    success: true,
    appointments,
  });
};


exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

 const allowedStatuses = [
  'CANCELLED',
  'COMPLETED',
  'NO_SHOW',
];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status value',
      });
    }

const doctor = await Doctor.findOne({ userId: req.user._id
 });

const appointment = await Appointment.findOne({
  _id: appointmentId,
  doctorId: doctor._id,
});


    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
      });
    }

    // 🔐 Role-based rules
    if (
      (status === 'COMPLETED' || status === 'NO_SHOW') &&
      req.user.role !== 'doctor'
    ) {
      return res.status(403).json({
        message: 'Only doctors can mark appointment as completed or no-show',
      });
    }

    if (status === 'CANCELLED') {
      // Patient can cancel only their own appointment
      if (
        req.user.role === 'patient' &&
        appointment.patientId.toString() !== req.user._id
      ) {
        return res.status(403).json({
          message: 'Not allowed to cancel this appointment',
        });
      }
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (err) {
    console.error('updateAppointmentStatus error:', err);
    res.status(500).json({
      message: 'Server error',
    });
  }
};
