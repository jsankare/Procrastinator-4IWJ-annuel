import { Router } from 'express';
import { UserController } from '../controllers/userController.js';

const router = Router();

// Authentication routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Email verification routes
router.post('/verify-email', UserController.verifyEmail);
router.post('/resend-verification', UserController.resendVerification);

// User profile routes (requires authentication)
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

// Admin routes for user management
router.get('/users/stats', UserController.getUserStats);
router.get('/users', UserController.getAllUsers);
router.get('/users/:id', UserController.getUserById);
router.put('/users/:id', UserController.updateUserById);
router.delete('/users/:id', UserController.deleteUserById);

export default router;
