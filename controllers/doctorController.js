import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Doctor } from '../models/Doctor.js';
import { DoctorWeeklySchedule } from '../models/DoctorAvailabilty.js';
import { startOfDay, endOfDay } from 'date-fns';
// Register Doctor
export const registerDoctor = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await Doctor.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const doctor = new Doctor({ ...req.body, password: hashed });
    await doctor.save();

    res.status(201).json({ message: 'Doctor registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login Doctor
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.status(400).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, doctor.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ doctorId: doctor._id }, process.env.JWT_SECRET, { expiresIn: "2d" });
    res.status(200).json({ token, doctor: { name: doctor.name, email: doctor.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get doctor profile by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// controllers/doctorController.js
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.doctorId).select('-password');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    // Only allow certain fields to be updated
    const {
      name,
      specialty,
      qualifications,
      bio,
      clinicAddress,
      phone,
      experience,
      fee,
      image,
      status,
      location // Expect `location` as { type: 'Point', coordinates: [lng, lat] }
    } = req.body;

    const updateFields = {
      name,
      specialty,
      qualifications,
      bio,
      clinicAddress,
      phone,
      experience,
      fee,
      image,
      status
    };

    // Only include location if provided
    if (location && Array.isArray(location.coordinates)) {
      updateFields['location.type'] = location.type;
      updateFields['location.coordinates'] = location.coordinates;
    }

    const updated = await Doctor.findByIdAndUpdate(
      req.user.doctorId,
      updateFields, // dot-notation for nested fields
      { new: true, runValidators: true, select: '-password' }
    );

    if (!updated) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Profile updated', doctor: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const findNearbyDoctors = async (req, res) => {
  const { lat, lng, radius = 5000, specialty } = req.query;
  if (!lat || !lng) return res.status(400).json({ message: "Missing lat/lng" });

  const coords = [parseFloat(lng), parseFloat(lat)];

  const geoQuery = {
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: coords },
        $maxDistance: parseInt(radius),
      },
    },
  };

  if (specialty && specialty !== 'all') {
    geoQuery.specialty = specialty; // make sure your model uses this field name
  }

  try {
    const doctors = await Doctor.find(geoQuery);
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}



export const setAvailability = async (req, res) => {
  try {
    const { doctor, schedule } = req.body;

    // Validate input
    if (!doctor || !schedule) {
      return res.status(400).json({ message: "doctor and schedule are required." });
    }

    let existing = await DoctorWeeklySchedule.findOne({ doctor });

    if (existing) {
      existing.schedule = schedule;
      await existing.save();
      return res.status(200).json({ message: "Weekly schedule updated successfully.", data: existing });
    } else {
      const newSchedule = await DoctorWeeklySchedule.create({ doctor, schedule });
      return res.status(201).json({ message: "Weekly schedule created successfully.", data: newSchedule });
    }
  } catch (err) {
    console.error("setAvailability error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Assuming you use doctorId and date from req.query



// Full week for doctor's editor/dashboard
export const getFullWeeklyAvailability = async (req, res) => {
  const { doctorId } = req.query;
  if (!doctorId) {
    return res.status(400).json({ message: 'doctorId is required.' });
  }

  try {
    const scheduleDoc = await DoctorWeeklySchedule.findOne({ doctor: doctorId });
    if (!scheduleDoc) {
      return res.status(404).json({ message: 'Doctor weekly schedule not found.' });
    }
    // Just send the whole .schedule obj
    return res.status(200).json({ data: scheduleDoc.schedule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
