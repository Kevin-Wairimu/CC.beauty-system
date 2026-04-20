import express from 'express';
import { createEnquiry, getEnquiries, deleteEnquiry, updateEnquiry } from '../controllers/enquiryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { enquirySchema } from '../utils/schemas.js';

const router = express.Router();

router.post('/', validate(enquirySchema), createEnquiry);
router.get('/', protect, authorize('admin', 'manager'), getEnquiries);
router.put('/:id', protect, authorize('admin', 'manager'), updateEnquiry);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteEnquiry);

export default router;
