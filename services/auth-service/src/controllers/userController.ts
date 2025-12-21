import { Request, Response } from 'express';
import { UserModel } from '../models/User.js';
import { JWTUtils } from '../utils/jwt.js';
import { EmailService } from '../utils/email.js';
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
          message: 'Invalid email or password',
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
          message: 'Invalid email or password',
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
}
