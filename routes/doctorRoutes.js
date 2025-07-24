import express from 'express';
import { registerDoctor, loginDoctor, getDoctorById, getDoctorProfile, updateDoctorProfile, findNearbyDoctors, getAllDoctors, setAvailability, getFullWeeklyAvailability } from '../controllers/doctorController.js';
import { authenticateJWT } from '../middleware/authenticateJWT.js';

const router = express.Router();

router.post('/register', registerDoctor);
router.post('/login', loginDoctor);

router.get('/profile', authenticateJWT, getDoctorProfile);
router.patch('/profile/:id', authenticateJWT, updateDoctorProfile);

router.get('/all', getAllDoctors); // MOVE ABOVE :id
router.get('/nearby', findNearbyDoctors);

router.post('/availability', setAvailability);       // Create/update
router.get('/availability', getFullWeeklyAvailability);  
router.get('/:id', getDoctorById); // KEEP THIS LAST


export default router;
