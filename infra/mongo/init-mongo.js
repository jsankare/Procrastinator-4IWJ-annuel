// Switch to the procrastinator database
db = db.getSiblingDB("procrastinator");

// Create application user with read/write permissions
db.createUser({
  user: "procrastinator_user",
  pwd: "procrastinator_pass",
  roles: [
    {
      role: "readWrite",
      db: "procrastinator",
    },
  ],
});

// Create users collection with indexes
db.createCollection("users");

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });
db.users.createIndex({ isActive: 1 });

// Create tasks collection (for future use)
db.createCollection("tasks");
db.tasks.createIndex({ userId: 1 });
db.tasks.createIndex({ status: 1 });
db.tasks.createIndex({ priority: 1 });
db.tasks.createIndex({ dueDate: 1 });
db.tasks.createIndex({ createdAt: 1 });

// Create sessions collection for authentication
db.createCollection("sessions");
db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ token: 1 }, { unique: true });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Insert a default admin user for testing
db.users.insertOne({
  _id: ObjectId(),
  username: "admin",
  email: "admin@procrastinator.com",
  password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewxJxzPlSqSj3lRG", // "admin123" hashed
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  isActive: true,
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: null,
  preferences: {
    theme: "light",
    language: "fr",
    notifications: {
      email: true,
      push: true,
    },
  },
  profile: {
    avatar: null,
    bio: "Administrator account",
    location: null,
    website: null,
  },
});

print("MongoDB initialization completed successfully!");
print("Collections created: users, tasks, sessions");
print("Application user created: procrastinator_user");
print(
  "Default admin user created: admin@procrastinator.com (password: admin123)",
);
