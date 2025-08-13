// models/Appointment.js
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  scheduledFor: { type: Date, required: true },
  status: { type: String, enum: ["booked", "cancelled", "completed"], default: "booked" },
  notes: String,
}, { timestamps: true });

// Prevent double-booking: one doctor cannot have two appointments at the same time
appointmentSchema.index({ doctor: 1, scheduledFor: 1 }, { unique: true });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
