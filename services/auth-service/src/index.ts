import 'dotenv/config';
import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import Database from './config/database.js';
import { UserModel } from './models/User.js';
import userRoutes from './routes/userRoutes.js';

// Configuration - Utilise les variables d'environnement
const app: Application = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const SERVICE_NAME = process.env.SERVICE_NAME || 'auth-service';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Allow multiple origins for CORS
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost';
process.env.FRONTEND_URL = FRONTEND_URL;

const frontendHost = FRONTEND_URL.replace(/:\d+$/, '');
const allowedOrigins = [
  FRONTEND_URL,
  `${frontendHost}:3000`,
  `${frontendHost}:85`,
  'http://127.0.0.1',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:85',
];

const database = Database.getInstance();

// Trust proxy - Required for Traefik
app.set('trust proxy', 1);

// Middlewares de sécurité
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de requêtes, réessayez plus tard.',
    timestamp: new Date().toISOString(),
  },
});
app.use(limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';

  console.log(
    `[${SERVICE_NAME}] ${timestamp} - ${req.method} ${req.path} - IP: ${ip} - UA: ${userAgent}`,
  );
  next();
});

// ==================== ROUTES ====================

// Health check endpoint with database status
app.get('/health', async (req: Request, res: Response) => {
  try {
    const dbHealth = await database.healthCheck();

    res.json({
      status: 'healthy',
      service: SERVICE_NAME,
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        usage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      database: dbHealth,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: SERVICE_NAME,
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: `🔐 ${SERVICE_NAME} is running`,
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      health: '/health',
      // Authentication
      register: 'POST /register',
      login: 'POST /login',
      // User profile
      profile: 'GET /profile (requires auth)',
      updateProfile: 'PUT /profile (requires auth)',
      // Admin user management
      users: 'GET /users (admin only)',
      userById: 'GET /users/:id (admin only)',
      updateUser: 'PUT /users/:id (admin only)',
      deleteUser: 'DELETE /users/:id (admin only)',
      userStats: 'GET /users/stats (admin only)',
    },
    documentation: 'See APIDOG.md for detailed API documentation',
    timestamp: new Date().toISOString(),
  });
});

app.use('/', userRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${SERVICE_NAME}] Error on ${req.method} ${req.path}:`, err.stack);

  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: err.message,
      timestamp: new Date().toISOString(),
      ...(NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ==================== SERVER STARTUP ====================

async function startServer() {
  try {
    await database.connect();
    UserModel.initialize();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 ===================================`);
      console.log(`✅ [${SERVICE_NAME}] Server running`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/ (see APIDOG.md)`);
      console.log(`🎯 Ready to accept requests!`);
      console.log(`=====================================\n`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log(`\n[${SERVICE_NAME}] Shutting down gracefully...`);

      server.close(async () => {
        try {
          await database.disconnect();
          console.log(`[${SERVICE_NAME}] Server and database connections closed`);
          process.exit(0);
        } catch (error) {
          console.error(`[${SERVICE_NAME}] Error during graceful shutdown:`, error);
          process.exit(1);
        }
      });

      // Force close after 10s
      setTimeout(() => {
        console.error(`[${SERVICE_NAME}] Forced shutdown`);
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error(`❌ [${SERVICE_NAME}] Failed to start server:`, error);
    process.exit(1);
  }
}

// Unhandled errors
process.on('uncaughtException', (err: Error) => {
  console.error(`❌ [${SERVICE_NAME}] Uncaught Exception:`, err);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error(`❌ [${SERVICE_NAME}] Unhandled Rejection:`, reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;
