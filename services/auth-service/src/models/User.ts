import { Collection, ObjectId, Filter, UpdateFilter, FindOptions } from 'mongodb';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import Database from '../config/database.js';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  ValidationError,
} from '../types/User.js';

export class UserModel {
  private static collection: Collection<User>;

  static initialize() {
    const db = Database.getInstance();
    this.collection = db.getCollection<User>('users');
  }

  // Validation methods
  private static validateEmail(email: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!email) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!validator.isEmail(email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    return errors;
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

  private static validateUsername(username: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!username) {
      errors.push({ field: 'username', message: 'Username is required' });
    } else if (username.length < 3) {
      errors.push({ field: 'username', message: 'Username must be at least 3 characters long' });
    } else if (username.length > 30) {
      errors.push({ field: 'username', message: 'Username must not exceed 30 characters' });
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push({
        field: 'username',
        message: 'Username can only contain letters, numbers, hyphens, and underscores',
      });
    }

    return errors;
  }

  private static validateCreateUser(data: CreateUserRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate required fields
    if (!data.firstName?.trim()) {
      errors.push({ field: 'firstName', message: 'First name is required' });
    }

    if (!data.lastName?.trim()) {
      errors.push({ field: 'lastName', message: 'Last name is required' });
    }

    // Add specific validations
    errors.push(...this.validateEmail(data.email));
    errors.push(...this.validateUsername(data.username));
    errors.push(...this.validatePassword(data.password));

    return errors;
  }

  // Hash password
  private static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Remove sensitive fields from user object
  private static sanitizeUser(user: User): Omit<User, 'password'> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  // Create new user
  static async create(
    userData: CreateUserRequest,
  ): Promise<{ success: boolean; data?: Omit<User, 'password'>; errors?: ValidationError[] }> {
    try {
      // Validate input
      const validationErrors = this.validateCreateUser(userData);
      if (validationErrors.length > 0) {
        return { success: false, errors: validationErrors };
      }

      // Check if user already exists
      const existingUser = await this.collection.findOne({
        $or: [
          { email: userData.email.toLowerCase() },
          { username: userData.username.toLowerCase() },
        ],
      });

      if (existingUser) {
        const errors: ValidationError[] = [];
        if (existingUser.email === userData.email.toLowerCase()) {
          errors.push({ field: 'email', message: 'Email already exists' });
        }
        if (existingUser.username === userData.username.toLowerCase()) {
          errors.push({ field: 'username', message: 'Username already exists' });
        }
        return { success: false, errors };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user object
      const newUser: User = {
        username: userData.username.toLowerCase(),
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        role: 'user',
        isActive: true,
        isEmailVerified: false,
        isTwoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        preferences: {
          theme: 'light',
          language: 'fr',
          notifications: {
            email: true,
            push: true,
          },
        },
        profile: {
          avatar: null,
          bio: null,
          location: null,
          website: null,
        },
      };

      const result = await this.collection.insertOne(newUser);
      const createdUser = await this.collection.findOne({ _id: result.insertedId });

      if (!createdUser) {
        throw new Error('Failed to create user');
      }

      return {
        success: true,
        data: this.sanitizeUser(createdUser),
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    try {
      if (!ObjectId.isValid(id)) {
        return null;
      }

      return await this.collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.collection.findOne({ email: email.toLowerCase() });
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username: string): Promise<User | null> {
    try {
      return await this.collection.findOne({ username: username.toLowerCase() });
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  // Find user by verification token
  static async findByVerificationToken(token: string): Promise<User | null> {
    try {
      return await this.collection.findOne({ emailVerificationToken: token });
    } catch (error) {
      console.error('Error finding user by verification token:', error);
      throw error;
    }
  }

  // Update user
  static async updateById(
    id: string,
    updateData: UpdateUserRequest,
  ): Promise<{ success: boolean; data?: Omit<User, 'password'>; errors?: ValidationError[] }> {
    try {
      if (!ObjectId.isValid(id)) {
        return { success: false, errors: [{ field: 'id', message: 'Invalid user ID' }] };
      }

      // Validate update data
      const errors: ValidationError[] = [];

      if (updateData.email) {
        errors.push(...this.validateEmail(updateData.email));

        // Check if email is already taken by another user
        const existingUser = await this.collection.findOne({
          email: updateData.email.toLowerCase(),
          _id: { $ne: new ObjectId(id) },
        });

        if (existingUser) {
          errors.push({ field: 'email', message: 'Email already exists' });
        }
      }

      if (updateData.username) {
        errors.push(...this.validateUsername(updateData.username));

        // Check if username is already taken by another user
        const existingUser = await this.collection.findOne({
          username: updateData.username.toLowerCase(),
          _id: { $ne: new ObjectId(id) },
        });

        if (existingUser) {
          errors.push({ field: 'username', message: 'Username already exists' });
        }
      }

      if (errors.length > 0) {
        return { success: false, errors };
      }

      // Prepare update object
      const updateDoc: any = {
        updatedAt: new Date(),
      };

      if (updateData.username) {
        updateDoc.username = updateData.username.toLowerCase();
      }

      if (updateData.email) {
        updateDoc.email = updateData.email.toLowerCase();
      }

      if (updateData.firstName) {
        updateDoc.firstName = updateData.firstName.trim();
      }

      if (updateData.lastName) {
        updateDoc.lastName = updateData.lastName.trim();
      }

      if (updateData.preferences) {
        updateDoc.preferences = updateData.preferences;
      }

      if (updateData.profile) {
        updateDoc.profile = updateData.profile;
      }

      if (updateData.emailVerificationToken !== undefined) {
        updateDoc.emailVerificationToken = updateData.emailVerificationToken;
      }

      if (updateData.emailVerificationExpires !== undefined) {
        updateDoc.emailVerificationExpires = updateData.emailVerificationExpires;
      }

      if (updateData.isEmailVerified !== undefined) {
        updateDoc.isEmailVerified = updateData.isEmailVerified;
      }

      if (updateData.isTwoFactorEnabled !== undefined) {
        updateDoc.isTwoFactorEnabled = updateData.isTwoFactorEnabled;
      }

      if (updateData.totpSecret !== undefined) {
        updateDoc.totpSecret = updateData.totpSecret;
      }

      if (updateData.backupCodes !== undefined) {
        updateDoc.backupCodes = updateData.backupCodes;
      }

      const updateFields: UpdateFilter<User> = {
        $set: updateDoc,
      };

      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        updateFields,
        { returnDocument: 'after' },
      );

      if (!result) {
        return { success: false, errors: [{ field: 'id', message: 'User not found' }] };
      }

      return {
        success: true,
        data: this.sanitizeUser(result),
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  static async deleteById(id: string): Promise<{ success: boolean; errors?: ValidationError[] }> {
    try {
      if (!ObjectId.isValid(id)) {
        return { success: false, errors: [{ field: 'id', message: 'Invalid user ID' }] };
      }

      const result = await this.collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return { success: false, errors: [{ field: 'id', message: 'User not found' }] };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get all users with pagination and filtering
  static async findAll(filters: UserFilters = {}): Promise<{
    users: Omit<User, 'password'>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        role,
        isActive,
        isEmailVerified,
      } = filters;

      // Build filter query
      const query: Filter<User> = {};

      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
        ];
      }

      if (role) {
        query.role = role as any;
      }

      if (typeof isActive === 'boolean') {
        query.isActive = isActive;
      }

      if (typeof isEmailVerified === 'boolean') {
        query.isEmailVerified = isEmailVerified;
      }

      // Build sort options
      const sortOptions: any = {};
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query
      const findOptions: FindOptions = {
        sort: sortOptions,
        skip,
        limit,
        projection: { password: 0 }, // Exclude password field
      };

      const [users, total] = await Promise.all([
        this.collection.find(query, findOptions).toArray(),
        this.collection.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        users: users as Omit<User, 'password'>[],
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('Error finding users:', error);
      throw error;
    }
  }

  // Update last login time
  static async updateLastLogin(id: string): Promise<void> {
    try {
      if (ObjectId.isValid(id)) {
        await this.collection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              lastLoginAt: new Date(),
              updatedAt: new Date(),
            },
          },
        );
      }
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  // Check if user exists
  static async exists(query: { email?: string; username?: string; id?: string }): Promise<boolean> {
    try {
      const filter: Filter<User> = {};

      if (query.email) {
        filter.email = query.email.toLowerCase();
      }

      if (query.username) {
        filter.username = query.username.toLowerCase();
      }

      if (query.id && ObjectId.isValid(query.id)) {
        filter._id = new ObjectId(query.id);
      }

      const count = await this.collection.countDocuments(filter, { limit: 1 });
      return count > 0;
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw error;
    }
  }

  // Get user stats
  static async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
    byRole: Record<string, number>;
  }> {
    try {
      const [total, active, verified, roleStats] = await Promise.all([
        this.collection.countDocuments(),
        this.collection.countDocuments({ isActive: true }),
        this.collection.countDocuments({ isEmailVerified: true }),
        this.collection
          .aggregate([
            {
              $group: {
                _id: '$role',
                count: { $sum: 1 },
              },
            },
          ])
          .toArray(),
      ]);

      const byRole: Record<string, number> = {};
      roleStats.forEach((stat: any) => {
        byRole[stat._id] = stat.count;
      });

      return {
        total,
        active,
        inactive: total - active,
        verified,
        unverified: total - verified,
        byRole,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
}
