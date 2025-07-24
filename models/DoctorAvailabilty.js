import mongoose from 'mongoose';

const weeklyScheduleSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    unique: true // Ensures each doctor only has one schedule
    // Do NOT also add .index() below!
  },
  schedule: {
    mon: {
      active: { type: Boolean, default: false },
      slots: [{ type: String }]
    },
    tue: {
      active: { type: Boolean, default: false },
      slots: [{ type: String }]
    },
    wed: {
      active: { type: Boolean, default: false },
      slots: [{ type: String }]
    },
    thu: {
      active: { type: Boolean, default: false },
      slots: [{ type: String }]
    },
    fri: {
      active: { type: Boolean, default: false },
      slots: [{ type: String }]
    },
    sat: {
      active: { type: Boolean, default: false },
      slots: [{ type: String }]
    },
    sun: {
      active: { type: Boolean, default: false },
      slots: [{ type: String }]
    }
  }
}, { timestamps: true });

// DO NOT include any schema.index({ doctor: 1 }, { unique: true }) below!

export const DoctorWeeklySchedule = mongoose.model('DoctorWeeklySchedule', weeklyScheduleSchema);
