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
db.users.createIndex({email: 1}, {unique: true});
db.users.createIndex({username: 1}, {unique: true});
db.users.createIndex({createdAt: 1});
db.users.createIndex({isActive: 1});

// Create tasks collection
db.createCollection("tasks");
db.tasks.createIndex({userId: 1});
db.tasks.createIndex({status: 1});
db.tasks.createIndex({priority: 1});
db.tasks.createIndex({dueDate: 1});
db.tasks.createIndex({createdAt: 1});

// Create workspaces collection
db.createCollection("workspaces");
db.workspaces.createIndex({ownerId: 1});
db.workspaces.createIndex({inviteCode: 1}, {unique: true});
db.workspaces.createIndex({"members.userId": 1});
db.workspaces.createIndex({name: 1});
db.workspaces.createIndex({createdAt: 1});
db.workspaces.createIndex({isActive: 1});

// Create sessions collection for authentication
db.createCollection("sessions");
db.sessions.createIndex({userId: 1});
db.sessions.createIndex({token: 1}, {unique: true});
db.sessions.createIndex({expiresAt: 1}, {expireAfterSeconds: 0});

const adminId = ObjectId();
const userId = ObjectId();

db.users.insertMany([
    {
        _id: adminId,
        username: "admin",
        email: "admin@procrastinator.com",
        password: "$2a$12$V42x92ird58VKP2p4KJKXePThbezcMnIWLVVdE9qNjgFSgrEisLke", // "admin123" hashed
        firstName: "Admin",
        lastName: "User",
        birthdate: new Date("1991-02-01"),
        role: "admin",
        points: 1500,
        streak: 11,
        completedTasks: 17,
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
    },
    {
        _id: userId,
        username: "user",
        email: "user@procrastinator.com",
        password: "$2a$12$V42x92ird58VKP2p4KJKXePThbezcMnIWLVVdE9qNjgFSgrEisLke", // "admin123" hashed
        firstName: "Lambda",
        lastName: "User",
        birthdate: new Date("1995-05-15"),
        role: "user",
        points: 110,
        streak: 3,
        completedTasks: 5,
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
            bio: "Regular user account",
            location: null,
            website: null,
        },
    },
]);

db.workspaces.insertMany([
    {
        _id: ObjectId(),
        name: "Admin Workspace",
        ownerId: adminId,
        inviteCode: "4DMN-W0RK",
        members: [
            {
                userId: adminId.toString(),
                role: "owner",
                isActive: true,
                joinedAt: new Date(),
            },
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        _id: ObjectId(),
        name: "User Workspace",
        ownerId: userId,
        inviteCode: "US3R-W0RK",
        members: [
            {
                userId: userId.toString(),
                role: "owner",
                isActive: true,
                joinedAt: new Date(),
            },
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
]);

print("MongoDB initialization completed successfully!");
print("Collections created: users, tasks, sessions, workspaces");
print("Application user created: procrastinator_user");
print("Seed data inserted: 2 users, 2 workspaces");
print("Default admin user: admin@procrastinator.com (password: admin123)");
print("Default lambda user: user@procrastinator.com (password: admin123)");
print("Admin Workspace invite code: T3ST-W0RK");
