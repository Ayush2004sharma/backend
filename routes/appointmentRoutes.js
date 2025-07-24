import express from 'express';
import {
  createAppointment,
  getUserAppointments,
  getDoctorAppointments,
  cancelAppointment,
  deleteAppointment
} from '../controllers/appointmentController.js';
import { authenticateJWT } from '../middleware/authenticateJWT.js';

const router = express.Router();

router.post('/:doctorId', authenticateJWT, createAppointment);

router.get('/user', authenticateJWT, getUserAppointments);
router.get('/doctor', authenticateJWT, getDoctorAppointments);
router.patch('/:id/cancel', authenticateJWT, cancelAppointment);
router.delete('/:id/delete', authenticateJWT,deleteAppointment)
export default router;
