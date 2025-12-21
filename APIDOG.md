# API Documentation - Procrastinator Auth Service

## Base URL
```
http://localhost/api/auth
```

## Authentication
Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All responses follow this structure:
```json
{
  "success": boolean,
  "message": string,
  "data": object | array | null,
  "timestamp": string,
  "errors": array (only on validation errors)
}
```

## Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## Endpoints

### 1. Health Check
**GET** `/health`

Check service and database status.

**Response:**
```json
{
  "status": "healthy",
  "service": "auth-service",
  "environment": "development",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "usage": 45,
    "total": 128
  },
  "database": {
    "status": "healthy",
    "database": "procrastinator",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Service Info
**GET** `/`

Get service information and available endpoints.

**Response:**
```json
{
  "success": true,
  "message": "🔐 auth-service is running",
  "version": "1.0.0",
  "environment": "development",
  "endpoints": {
    "health": "/health",
    "register": "POST /register",
    "login": "POST /login",
    "profile": "GET /profile (requires auth)",
    "updateProfile": "PUT /profile (requires auth)",
    "users": "GET /users (admin only)",
    "userById": "GET /users/:id (admin only)",
    "updateUser": "PUT /users/:id (admin only)",
    "deleteUser": "DELETE /users/:id (admin only)",
    "userStats": "GET /users/stats (admin only)"
  },
  "documentation": "See APIDOG.md for detailed API documentation",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Authentication Endpoints

### 3. Register User
**POST** `/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation Rules:**
- `username`: 3-30 chars, alphanumeric + hyphens/underscores only
- `email`: Valid email format
- `password`: Min 8 chars, must contain uppercase, lowercase, and number
- `firstName` & `lastName`: Required, non-empty

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true,
      "isEmailVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": null,
      "preferences": {
        "theme": "light",
        "language": "fr",
        "notifications": {
          "email": true,
          "push": true
        }
      },
      "profile": {
        "avatar": null,
        "bio": null,
        "location": null,
        "website": null
      }
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 4. Login User
**POST** `/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true,
      "isEmailVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-01-01T00:00:00.000Z",
      "preferences": {
        "theme": "light",
        "language": "fr",
        "notifications": {
          "email": true,
          "push": true
        }
      },
      "profile": {
        "avatar": null,
        "bio": null,
        "location": null,
        "website": null
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2024-01-08T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## User Profile Endpoints

### 5. Get Current User Profile
**GET** `/profile`

Get the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isActive": true,
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-01T00:00:00.000Z",
    "preferences": {
      "theme": "light",
      "language": "fr",
      "notifications": {
        "email": true,
        "push": true
      }
    },
    "profile": {
      "avatar": null,
      "bio": null,
      "location": null,
      "website": null
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 6. Update Current User Profile
**PUT** `/profile`

Update the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body (partial update allowed):**
```json
{
  "firstName": "Johnny",
  "lastName": "Doe",
  "preferences": {
    "theme": "dark",
    "language": "en",
    "notifications": {
      "email": false,
      "push": true
    }
  },
  "profile": {
    "bio": "Full-stack developer",
    "location": "Paris, France",
    "website": "https://johndoe.com"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "Johnny",
    "lastName": "Doe",
    "role": "user",
    "isActive": true,
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z",
    "lastLoginAt": "2024-01-01T00:00:00.000Z",
    "preferences": {
      "theme": "dark",
      "language": "en",
      "notifications": {
        "email": false,
        "push": true
      }
    },
    "profile": {
      "avatar": null,
      "bio": "Full-stack developer",
      "location": "Paris, France",
      "website": "https://johndoe.com"
    }
  },
  "timestamp": "2024-01-01T01:00:00.000Z"
}
```

---

## Admin User Management Endpoints

### 7. Get All Users (Admin Only)
**GET** `/users`

Get paginated list of all users with filtering and sorting.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 10): Items per page
- `sortBy` (string, default: 'createdAt'): Sort field
- `sortOrder` ('asc' | 'desc', default: 'desc'): Sort direction
- `search` (string): Search in name, email, username
- `role` (string): Filter by role
- `isActive` (boolean): Filter by active status
- `isEmailVerified` (boolean): Filter by email verification

**Example:**
```
GET /users?page=1&limit=5&search=john&role=user&isActive=true&sortBy=createdAt&sortOrder=desc
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "username": "johndoe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "user",
        "isActive": true,
        "isEmailVerified": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "lastLoginAt": "2024-01-01T00:00:00.000Z",
        "preferences": {
          "theme": "light",
          "language": "fr",
          "notifications": {
            "email": true,
            "push": true
          }
        },
        "profile": {
          "avatar": null,
          "bio": null,
          "location": null,
          "website": null
        }
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 5,
    "totalPages": 5
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 8. Get User by ID (Admin Only)
**GET** `/users/:id`

Get specific user by their ID.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**
- `id` (string): User ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isActive": true,
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-01T00:00:00.000Z",
    "preferences": {
      "theme": "light",
      "language": "fr",
      "notifications": {
        "email": true,
        "push": true
      }
    },
    "profile": {
      "avatar": null,
      "bio": null,
      "location": null,
      "website": null
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 9. Update User by ID (Admin Only)
**PUT** `/users/:id`

Update specific user by their ID.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**
- `id` (string): User ObjectId

**Request Body (partial update allowed):**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "role": "moderator",
  "isActive": false,
  "preferences": {
    "theme": "dark"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "moderator",
    "isActive": false,
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z",
    "lastLoginAt": "2024-01-01T00:00:00.000Z",
    "preferences": {
      "theme": "dark",
      "language": "fr",
      "notifications": {
        "email": true,
        "push": true
      }
    },
    "profile": {
      "avatar": null,
      "bio": null,
      "location": null,
      "website": null
    }
  },
  "timestamp": "2024-01-01T01:00:00.000Z"
}
```

### 10. Delete User by ID (Admin Only)
**DELETE** `/users/:id`

Delete specific user by their ID.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**
- `id` (string): User ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (400) - Cannot delete self:**
```json
{
  "success": false,
  "message": "Cannot delete your own account",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 11. Get User Statistics (Admin Only)
**GET** `/users/stats`

Get user statistics and analytics.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "total": 150,
    "active": 142,
    "inactive": 8,
    "verified": 89,
    "unverified": 61,
    "byRole": {
      "user": 145,
      "admin": 3,
      "moderator": 2
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Testing Examples

### Test Account
A default admin account is created during database initialization:
- **Email:** `admin@procrastinator.com`
- **Password:** `admin123`
- **Role:** `admin`

### Test Flow

1. **Login as admin:**
```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@procrastinator.com",
    "password": "admin123"
  }'
```

2. **Register new user:**
```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

3. **Get profile (requires token from login):**
```bash
curl -X GET http://localhost/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

4. **Get all users (admin only):**
```bash
curl -X GET "http://localhost/api/auth/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

5. **Update user profile:**
```bash
curl -X PUT http://localhost/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "preferences": {
      "theme": "dark"
    }
  }'
```

---

## HTTP Status Codes

- **200** - Success
- **201** - Created (registration)
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (invalid credentials or token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found (user/resource not found)
- **429** - Too Many Requests (rate limited)
- **500** - Internal Server Error
- **503** - Service Unavailable (database issues)

---

## Rate Limiting

The API is rate limited to **100 requests per 15 minutes** per IP address. When rate limited, you'll receive:

```json
{
  "success": false,
  "message": "Trop de requêtes, réessayez plus tard.",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Development Notes

- All passwords are hashed using bcrypt with 12 salt rounds
- JWT tokens expire after 7 days by default
- MongoDB indexes are created for performance on common queries
- Validation errors provide specific field-level feedback
- All timestamps are in ISO 8601 format (UTC)
- CORS is configured for development (allow all origins)