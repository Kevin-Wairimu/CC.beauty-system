import express from 'express';
import { createAppointment, getAppointments, deleteAppointment, updateAppointmentStatus } from '../controllers/appointmentController.js';
import { protect, tryProtect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Allow anyone to create, but protect for authenticated info
router.post('/', tryProtect, createAppointment);

// Protect get: only authorized users can see lists
router.get('/', protect, getAppointments);

// Admin/Manager/Client can delete appointment (Cancel)
router.delete('/:id', protect, deleteAppointment);

// Admin/Manager/Staff/Client can update status/assign (Logic in controller handles restrictions)
router.put('/:id/status', protect, updateAppointmentStatus);

export default router;
