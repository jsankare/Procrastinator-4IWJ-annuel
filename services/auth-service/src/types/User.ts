import { ObjectId } from 'mongodb';

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
}

export interface UserProfile {
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  obtainedAt: Date;
}

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  isTwoFactorEnabled: boolean;
  totpSecret?: string | null;
  backupCodes?: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
  preferences: UserPreferences;
  profile: UserProfile;
  // Gamification stats
  points: number;
  streak: number;
  completedTasks: number;
  level: number;
  badges: Badge[];
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  preferences?: Partial<UserPreferences>;
  profile?: Partial<UserProfile>;
  isEmailVerified?: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  isTwoFactorEnabled?: boolean;
  totpSecret?: string | null;
  backupCodes?: string[];
}

export interface UpdateStatsRequest {
  points?: number;
  incrementPoints?: number;
  streak?: number;
  incrementStreak?: number;
  completedTasks?: number;
  incrementCompletedTasks?: number;
  level?: number;
  incrementLevel?: number;
  badge?: Badge | Badge[]; // For adding single or multiple badges
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: Omit<User, 'password'>;
    token: string;
    expiresAt: Date;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: Omit<User, 'password'>;
  };
}

export interface UserResponse {
  success: boolean;
  message: string;
  data?: Omit<User, 'password'>;
}

export interface UsersListResponse {
  success: boolean;
  message: string;
  data?: {
    users: Omit<User, 'password'>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// JWT Payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Session interface
export interface Session {
  _id?: ObjectId;
  userId: ObjectId;
  token: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

// Validation error interface
export interface ValidationError {
  field: string;
  message: string;
}

// API Error response
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError[];
  timestamp: string;
}

// Pagination query parameters
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// User filters for listing
export interface UserFilters extends PaginationQuery {
  role?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
}
