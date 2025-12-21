import { Router } from 'express';
import { UserController } from '../controllers/userController.js';

const router = Router();

// Authentication routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Email verification routes
router.post('/verify-email', UserController.verifyEmail);
router.post('/resend-verification', UserController.resendVerification);

// Password recovery routes
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);

// Two-factor authentication routes
router.post('/setup-2fa', UserController.setupTwoFactor);
router.post('/enable-2fa', UserController.enableTwoFactor);
router.post('/verify-2fa', UserController.verifyTwoFactorToken);
router.post('/disable-2fa', UserController.disableTwoFactor);

// User profile routes (requires authentication)
router.get('/profile', UserController.getProfile);
router.get('/me', UserController.getProfile); // Alias for /profile
router.put('/profile', UserController.updateProfile);

// Admin routes for user management
router.get('/users/stats', UserController.getUserStats);
router.get('/users', UserController.getAllUsers);
router.get('/users/:id', UserController.getUserById);
router.put('/users/:id', UserController.updateUserById);
router.delete('/users/:id', UserController.deleteUserById);

export default router;
