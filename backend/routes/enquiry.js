import express from 'express';
import { createEnquiry, getEnquiries, deleteEnquiry } from '../controllers/enquiryController.js';

const router = express.Router();

router.post('/', createEnquiry);
router.get('/', getEnquiries);
router.delete('/:id', deleteEnquiry);

export default router;
