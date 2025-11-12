const Appointment = require("../models/appointmentModel");

// Create Appointment
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, patientName, date, time, apptNo } = req.body;

    if (!doctorId || !patientName || !date || !time || !apptNo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newAppointment = new Appointment({ doctorId, patientName, date, time, apptNo });
    await newAppointment.save();

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create appointment", error });
  }
};

// Get Appointments by Doctor ID
exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctorId });
    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments", error });
  }
};

// Update Appointment Status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({
      message: "Appointment status updated successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status", error });
  }
};
