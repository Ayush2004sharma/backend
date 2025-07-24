import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialty: { type: String, required: true },        // e.g., 'Cardiologist'
  qualifications: [String],                           // e.g., ['MBBS', 'MD']
  bio: String,
  clinicAddress: String,
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'offline'
  },                                                  // Enums for safety
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      default: [0, 0],
      validate: {
        validator: function(value) {
          // longitude: -180 to 180, latitude: -90 to 90
          return (
            Array.isArray(value) &&
            value.length === 2 &&
            value[0] >= -180 && value[0] <= 180 &&
            value[1] >= -90  && value[1] <= 90
          );
        },
        message: props => `${props.value} is not a valid [lng, lat] coordinate pair`
      }
    }
  },
  phone: String,
  experience: Number,                                 // Years of experience
  fee: Number,                                        // Consultation fee
  // Add any other relevant fields (profilePic, timings, reviews, etc.)
}, { timestamps: true });

// For efficient geo-queries (e.g., $near, $geoWithin)
DoctorSchema.index({ location: "2dsphere" });

export const Doctor = mongoose.model('Doctor', DoctorSchema);
