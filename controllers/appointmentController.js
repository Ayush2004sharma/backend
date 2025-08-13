// controllers/appointmentController.js
import { Appointment } from '../models/Appointment.js';
import { DoctorWeeklySchedule } from '../models/DoctorAvailabilty.js';
import mongoose from 'mongoose';


// Helper to format time slots
const formatSlot = (slot) => `${slot.startTime} - ${slot.endTime}`;

// Get available slots for a doctor on a specific date
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // 'YYYY-MM-DD'

    const doctorSchedule = await DoctorWeeklySchedule.findOne({ doctor: doctorId });
    if (!doctorSchedule) return res.status(404).json({ message: "Doctor schedule not found" });

    const dayMap = ['sun','mon','tue','wed','thu','fri','sat'];
    const day = dayMap[new Date(date).getDay()];
    const daySchedule = doctorSchedule.schedule[day];

    if (!daySchedule.active) return res.json({ availableSlots: [] });

    const startOfDay = new Date(date); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(date); endOfDay.setHours(23,59,59,999);

    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      scheduledFor: { $gte: startOfDay, $lte: endOfDay },
      status: "booked"
    });

    const bookedSlots = bookedAppointments.map(a => formatSlot({ startTime: a.scheduledFor.toTimeString().slice(0,5), endTime: a.scheduledFor.toTimeString().slice(0,5) }));

    const availableSlots = daySchedule.slots.filter(slot => !bookedSlots.includes(formatSlot(slot)));

    res.json({ availableSlots });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Book an appointment
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { userId, scheduledFor, notes } = req.body;

    console.log("Booking payload:", { doctorId, userId, scheduledFor, notes });

    // ✅ Validate scheduledFor
    const appointmentDate = new Date(scheduledFor);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // ✅ Check existing appointment
    const existing = await Appointment.findOne({
      doctor: doctorId,
      scheduledFor: appointmentDate,
      status: "booked"
    });
    if (existing) return res.status(400).json({ message: "Slot already booked" });

    // ✅ Create appointment
    const appointment = await Appointment.create({
      user: userId,
      doctor: doctorId,
      scheduledFor: appointmentDate,
      notes
    });

    res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (err) {
    // ✅ Handle duplicate key error
    if (err.code === 11000) return res.status(400).json({ message: "This slot is already booked" });

    console.error("Error booking appointment:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Cancel an appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = "cancelled";
    await appointment.save();

    res.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get appointments for a user
export const getUserAppointments = async (req, res) => {
  try {
    console.log("Fetching user appointments1 ",req.params);
    const { userId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }
      console.log("Fetching user appointments2");

    const appointments = await Appointment.find({ user: userId })
      .populate('doctor', 'name specialty');

    if (!appointments.length) {
      return res.status(404).json({ message: 'No appointments found' });
    }

    res.json({ appointments });
  } catch (error) {
    console.error('Error in getUserAppointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get appointments for a doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id; // assuming JWT has doctor ID
    const appointments = await Appointment.find({ doctor: doctorId }).populate('user', 'name email');
    res.json({ appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an appointment (optional)
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await Appointment.findByIdAndDelete(id);
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

