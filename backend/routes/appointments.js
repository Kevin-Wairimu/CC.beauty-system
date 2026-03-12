import express from 'express';
import { createAppointment, getAppointments, deleteAppointment, updateAppointmentStatus } from '../controllers/appointmentController.js';

const router = express.Router();

router.post('/', createAppointment);
router.get('/', getAppointments);
router.delete('/:id', deleteAppointment);
router.put('/:id/status', updateAppointmentStatus);

export default router;
