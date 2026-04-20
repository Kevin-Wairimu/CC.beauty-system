import express from 'express';
import { 
  authUser, registerUser, forgotPassword, resetPassword,
  getUsers, updateUserRole, deleteUser, getStaff, googleLogin, updateUserProfile 
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { loginSchema, registerSchema, profileUpdateSchema } from '../utils/schemas.js';

const router = express.Router();

router.post('/login', validate(loginSchema), authUser);
router.post('/register', validate(registerSchema), registerUser);
router.post('/google', googleLogin);
router.put('/profile', protect, validate(profileUpdateSchema), updateUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Public Staff list for booking
router.get('/staff', getStaff);

// Admin/Manager routes
router.get('/users', protect, authorize('admin', 'manager'), getUsers);
router.put('/users/:id/role', protect, authorize('admin', 'manager'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin', 'manager'), deleteUser);

export default router;
