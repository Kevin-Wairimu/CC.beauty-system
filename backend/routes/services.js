import express from 'express';
import { getServices, createService, updateService, deleteService } from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', getServices);

// Protect mutations
router.post('/', protect, authorize('admin', 'manager'), upload.single('image'), createService);
router.put('/:id', protect, authorize('admin', 'manager'), upload.single('image'), updateService);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteService);

export default router;
