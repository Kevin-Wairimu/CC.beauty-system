import express from 'express';
import { 
  authUser, registerUser, forgotPassword, resetPassword,
  getUsers, updateUserRole, deleteUser, getStaff 
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/register', registerUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Public Staff list for booking
router.get('/staff', getStaff);

// Admin/Manager routes
router.get('/users', protect, authorize('admin', 'manager'), getUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;
