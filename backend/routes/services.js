import express from 'express';
import { getServices, createService, updateService, deleteService } from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getServices);

// Protect mutations
router.post('/', protect, authorize('admin', 'manager'), createService);
router.put('/:id', protect, authorize('admin', 'manager'), updateService);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteService);

export default router;
