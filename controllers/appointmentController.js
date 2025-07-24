import Appointment from '../models/Appointment.js';

// Book a new appointment
export const createAppointment = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { scheduledFor, notes } = req.body;

    const appointment = new Appointment({
      user: req.user.userId,
      doctor: doctorId,
      scheduledFor,
      notes
    });

    await appointment.save();
    res.status(201).json({ message: 'Appointment booked!', appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get all appointments for the logged-in user
export const getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.userId })
      .populate('doctor', 'name specialty');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all appointments for the logged-in doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user.doctorId })
      .populate('user', 'name email');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel appointment (user or doctor can cancel)
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ message: "Appointment cancelled", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment deleted", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
} 
