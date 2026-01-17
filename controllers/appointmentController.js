const Appointment = require('../models/appointmentmodels');
const DoctorAvailability = require('../models/doctorAvailablity');
const generateSlots = require('../utils/slotGenerator');
const Doctor = require('../models/doctorsmodel');

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
      status: 'CONFIRMED',
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

    const { doctorId, date, slot } = req.body;

    if (!doctorId || !date || !slot) {
      return res.status(400).json({
        message: 'doctorId, date and slot are required',
      });
    }

    // ✅ doctorId = Doctor._id
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found',
      });
    }

    // 🔢 Token number
    const tokenNumber =
      (await Appointment.countDocuments({
        doctorId: doctor._id,
        date,
        status: 'CONFIRMED',
      })) + 1;

    const appointment = await Appointment.create({
      doctorId: doctor._id,
      patientId: req.user.id,
      date,
      slot,
      tokenNumber,
      status: 'CONFIRMED',
    });

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

/**
 * ================================
 * DOCTOR TODAY APPOINTMENTS
 * ================================
 */
exports.getDoctorTodayAppointments = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        message: 'Access denied',
      });
    }

    // 🔑 Map logged-in user → Doctor profile
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found',
      });
    }

    const today = new Date().toISOString().split('T')[0];

    const appointments = await Appointment.find({
      doctorId: doctor._id,
      date: today,
      status: 'CONFIRMED',
    }).sort({ slot: 1 });

    return res.status(200).json({
      success: true,
      date: today,
      appointments,
    });
  } catch (err) {
    console.error('getDoctorTodayAppointments error:', err);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      'CONFIRMED',
      'CANCELLED',
      'COMPLETED',
      'NO_SHOW',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status value',
      });
    }

    const appointment = await Appointment.findById(appointmentId);

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
        appointment.patientId.toString() !== req.user.id
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
