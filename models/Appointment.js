import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  scheduledFor: { type: Date, required: true },
  status: { type: String, enum: ["booked", "cancelled", "completed"], default: "booked" },
  notes: String,
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
