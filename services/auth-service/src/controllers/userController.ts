import { Request, Response } from 'express';
import { UserModel } from '../models/User.js';
import { JWTUtils } from '../utils/jwt.js';
import { EmailService } from '../utils/email.js';
import { TOTPUtils } from '../utils/totp.js';
import {
  CreateUserRequest,
  UpdateUserRequest,
  LoginRequest,
  UserFilters,
  ValidationError,
} from '../types/User.js';

export class UserController {
  /**
   * Register a new user
   * POST /register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;

      const result = await UserModel.create(userData);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: result.errors,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate verification token and send email
      const verificationToken = EmailService.generateVerificationToken();
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hours

      // Update user with verification token
      if (result.data && result.data._id) {
        await UserModel.updateById(result.data._id.toString(), {
          emailVerificationToken: verificationToken,
          emailVerificationExpires: tokenExpiry,
        });

        // Send verification email
        await EmailService.sendVerificationEmail(
          result.data.email,
          result.data.username,
          verificationToken
        );
      }

      res.status(201).json({
        success: true,
        message: 'User created successfully. Please check your email to verify your account.',
        data: {
          user: result.data,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Login user
   * POST /login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validation
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Find user by email
      const user = await UserModel.findByEmail(email);

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Identifiants non valides',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        res.status(403).json({
          success: false,
          message: 'Veuillez vérifier votre adresse e-mail avant de vous connecter. Consultez votre boîte de réception pour trouver le lien de vérification.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify password
      const isPasswordValid = await UserModel.verifyPassword(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Identifiants non valides',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if 2FA is enabled
      if (user.isTwoFactorEnabled) {
        res.status(200).json({
          success: true,
          message: 'Two-factor authentication required',
          data: {
            requiresTwoFactor: true,
            userId: user._id!.toString(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate JWT token
      const tokenPayload = {
        userId: user._id!.toString(),
        email: user.email,
        role: user.role,
      };

      const token = JWTUtils.generateToken(tokenPayload);
      const expiresAt = JWTUtils.getTokenExpirationDate(token);

      // Update last login time
      await UserModel.updateLastLogin(user._id!.toString());

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token,
          expiresAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get current user profile
   * GET /profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = JWTUtils.extractTokenFromHeader(authHeader);

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Authorization token is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const payload = JWTUtils.verifyToken(token);

      if (!payload) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await UserModel.findById(payload.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { password, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: userWithoutPassword,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving profile',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Update user profile
   * PUT /profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = JWTUtils.extractTokenFromHeader(authHeader);

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Authorization token is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const payload = JWTUtils.verifyToken(token);

      if (!payload) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const updateData: UpdateUserRequest = req.body;
      const result = await UserModel.updateById(payload.userId, updateData);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: result.errors,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating profile',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get all users (Admin only)
   * GET /users
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = JWTUtils.extractTokenFromHeader(authHeader);

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Authorization token is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const payload = JWTUtils.verifyToken(token);

      if (!payload || payload.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin access required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Parse query parameters
      const filters: UserFilters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        search: req.query.search as string,
        role: req.query.role as string,
      };

      // Handle boolean filters separately to satisfy strict type checking
      if (req.query.isActive === 'true') {
        filters.isActive = true;
      } else if (req.query.isActive === 'false') {
        filters.isActive = false;
      }

      if (req.query.isEmailVerified === 'true') {
        filters.isEmailVerified = true;
      } else if (req.query.isEmailVerified === 'false') {
        filters.isEmailVerified = false;
      }

      const result = await UserModel.findAll(filters);

      res.json({
        success: true,
        message: 'Users retrieved successfully',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving users',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get user by ID (Admin only)
   * GET /users/:id
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = JWTUtils.extractTokenFromHeader(authHeader);

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Authorization token is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const payload = JWTUtils.verifyToken(token);

      if (!payload || payload.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin access required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await UserModel.findById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { password, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'User retrieved successfully',
        data: userWithoutPassword,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving user',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Update user by ID (Admin only)
   * PUT /users/:id
   */
  static async updateUserById(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = JWTUtils.extractTokenFromHeader(authHeader);

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Authorization token is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const payload = JWTUtils.verifyToken(token);

      if (!payload || payload.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin access required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const updateData: UpdateUserRequest = req.body;

      const result = await UserModel.updateById(id, updateData);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: result.errors,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Update user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating user',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Delete user by ID (Admin only)
   * DELETE /users/:id
   */
  static async deleteUserById(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = JWTUtils.extractTokenFromHeader(authHeader);

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Authorization token is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const payload = JWTUtils.verifyToken(token);

      if (!payload || payload.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin access required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Prevent admin from deleting themselves
      if (id === payload.userId) {
        res.status(400).json({
          success: false,
          message: 'Cannot delete your own account',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await UserModel.deleteById(id);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Failed to delete user',
          errors: result.errors,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Delete user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting user',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get user statistics (Admin only)
   * GET /users/stats
   */
  static async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = JWTUtils.extractTokenFromHeader(authHeader);

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Authorization token is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const payload = JWTUtils.verifyToken(token);

      if (!payload || payload.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin access required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const stats = await UserModel.getStats();

      res.json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving statistics',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Verify email with token
   * POST /verify-email
   */
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Verification token is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Find user with this verification token
      const user = await UserModel.findByVerificationToken(token);

      if (!user) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if token is expired
      if (user.emailVerificationExpires && new Date() > new Date(user.emailVerificationExpires)) {
        res.status(400).json({
          success: false,
          message: 'Verification token has expired. Please request a new one.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if already verified
      if (user.isEmailVerified) {
        res.status(200).json({
          success: true,
          message: 'Email already verified',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Update user to verified
      if (user._id) {
        await UserModel.updateById(user._id.toString(), {
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during email verification',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Resend verification email
   * POST /resend-verification
   */
  static async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await UserModel.findByEmail(email);

      if (!user) {
        // Don't reveal if user exists or not
        res.status(200).json({
          success: true,
          message: 'If an account with that email exists, a verification email has been sent.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if already verified
      if (user.isEmailVerified) {
        res.status(200).json({
          success: true,
          message: 'Email is already verified',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate new verification token
      const verificationToken = EmailService.generateVerificationToken();
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24);

      // Update user with new token
      if (user._id) {
        await UserModel.updateById(user._id.toString(), {
          emailVerificationToken: verificationToken,
          emailVerificationExpires: tokenExpiry,
        });
      }

      // Send verification email
      await EmailService.sendVerificationEmail(
        user.email,
        user.username,
        verificationToken
      );

      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while resending verification',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Setup 2FA
  static async setupTwoFactor(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await UserModel.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate TOTP secret
      const secret = TOTPUtils.generateSecret(user.email);
      const qrCode = await TOTPUtils.generateQRCode(secret.otpauth_url!);
      const backupCodes = TOTPUtils.generateBackupCodes();

      res.json({
        success: true,
        message: 'Two-factor setup initialized',
        data: {
          secret: secret.base32,
          qrCode: qrCode,
          backupCodes: backupCodes,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while setting up 2FA',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Enable 2FA
  static async enableTwoFactor(req: Request, res: Response): Promise<void> {
    try {
      const { userId, secret, token, backupCodes } = req.body;

      if (!userId || !secret || !token || !backupCodes) {
        res.status(400).json({
          success: false,
          message: 'User ID, secret, token, and backup codes are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify the token
      const isValid = TOTPUtils.verifyToken(secret, token);

      if (!isValid) {
        res.status(400).json({
          success: false,
          message: 'Invalid TOTP token',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Hash backup codes
      const hashedBackupCodes = backupCodes.map((code: string) => TOTPUtils.hashBackupCode(code));

      // Update user with 2FA settings
      const user = await UserModel.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const updatedUser = await UserModel.updateById(userId, {
        isTwoFactorEnabled: true,
        totpSecret: secret,
        backupCodes: hashedBackupCodes,
      });

      if (!updatedUser.success || !updatedUser.data) {
        res.status(500).json({
          success: false,
          message: 'Failed to enable 2FA',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const userWithoutPassword = updatedUser.data;

      res.json({
        success: true,
        message: 'Two-factor authentication enabled successfully',
        data: { user: userWithoutPassword },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while enabling 2FA',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Verify 2FA token during login
  static async verifyTwoFactorToken(req: Request, res: Response): Promise<void> {
    try {
      const { userId, token } = req.body;

      if (!userId || !token) {
        res.status(400).json({
          success: false,
          message: 'User ID and token are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await UserModel.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!user.isTwoFactorEnabled || !user.totpSecret) {
        res.status(400).json({
          success: false,
          message: 'Two-factor authentication is not enabled',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Try TOTP token first
      const isTOTPValid = TOTPUtils.verifyToken(user.totpSecret, token);

      // Try backup codes
      let isBackupCodeValid = false;
      if (!isTOTPValid && user.backupCodes) {
        isBackupCodeValid = TOTPUtils.verifyBackupCode(token, user.backupCodes);
        if (isBackupCodeValid) {
          // Remove used backup code
          const newBackupCodes = user.backupCodes.filter((code) => code !== TOTPUtils.hashBackupCode(token));
          await UserModel.updateById(userId, { backupCodes: newBackupCodes });
        }
      }

      if (!isTOTPValid && !isBackupCodeValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid 2FA token',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate JWT token
      const tokenPayload = {
        userId: user._id!.toString(),
        email: user.email,
        role: user.role,
      };

      const jwtToken = JWTUtils.generateToken(tokenPayload);
      const expiresAt = JWTUtils.getTokenExpirationDate(jwtToken);

      // Update last login time
      await UserModel.updateLastLogin(user._id!.toString());

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: '2FA verification successful',
        data: {
          user: userWithoutPassword,
          token: jwtToken,
          expiresAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while verifying 2FA',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Disable 2FA
  static async disableTwoFactor(req: Request, res: Response): Promise<void> {
    try {
      const { userId, password } = req.body;

      if (!userId || !password) {
        res.status(400).json({
          success: false,
          message: 'User ID and password are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await UserModel.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify password
      const isPasswordValid = await UserModel.verifyPassword(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid password',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Disable 2FA
      const updatedUser = await UserModel.updateById(userId, {
        isTwoFactorEnabled: false,
        totpSecret: null,
        backupCodes: [],
      });

      if (!updatedUser.success || !updatedUser.data) {
        res.status(500).json({
          success: false,
          message: 'Failed to disable 2FA',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const userWithoutPassword = updatedUser.data;

      res.json({
        success: true,
        message: 'Two-factor authentication disabled successfully',
        data: { user: userWithoutPassword },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while disabling 2FA',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Request password reset
   * POST /forgot-password
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await UserModel.findByEmail(email);

      if (!user) {
        // Don't reveal if email exists
        res.json({
          success: true,
          message: 'If an account with this email exists, you will receive password reset instructions',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate reset token
      const resetToken = EmailService.generateVerificationToken();
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 1); // 1 hour validity

      // Update user with reset token
      if (user._id) {
        await UserModel.updateResetToken(user._id.toString(), resetToken, tokenExpiry);

        // Send reset email
        await EmailService.sendPasswordResetEmail(email, user.username, resetToken, user._id.toString());
      }

      res.json({
        success: true,
        message: 'If an account with this email exists, you will receive password reset instructions',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while processing password reset request',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Reset password
   * POST /reset-password
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { userId, token, newPassword } = req.body;

      if (!userId || !token || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'User ID, token, and new password are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify reset token
      const isValidToken = await UserModel.verifyResetToken(userId, token);

      if (!isValidToken) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired reset token',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate new password
      const passwordErrors = UserController.validatePassword(newPassword);
      if (passwordErrors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Password validation failed',
          errors: passwordErrors,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Update password
      const success = await UserModel.updatePassword(userId, newPassword);

      if (!success) {
        res.status(500).json({
          success: false,
          message: 'Failed to update password',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        message: 'Password reset successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while resetting password',
        timestamp: new Date().toISOString(),
      });
    }
  }

  private static validatePassword(password: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!password) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.push({
        field: 'password',
        message:
          'Password must contain at least one lowercase letter, one uppercase letter, and one number',
      });
    }

    return errors;
  }
}
