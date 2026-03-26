import express from 'express';
import { createAppointment, getAppointments, deleteAppointment, updateAppointmentStatus } from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Allow anyone to create, but protect for authenticated info
router.post('/', protect, createAppointment);

// Protect get: only authorized users can see lists
router.get('/', protect, getAppointments);

// Only Admin/Manager can delete
router.delete('/:id', protect, authorize('admin', 'manager'), deleteAppointment);

// Only Admin/Manager/Staff can update status/assign staff
router.put('/:id/status', protect, authorize('admin', 'manager', 'staff'), updateAppointmentStatus);

export default router;
