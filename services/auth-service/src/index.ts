import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Configuration - Utilise les variables d'environnement
const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const SERVICE_NAME = process.env.SERVICE_NAME || 'auth-service';
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middlewares de sécurité
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  message: 'Trop de requêtes, réessayez plus tard.',
});
app.use(limiter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${SERVICE_NAME}] ${timestamp} - ${req.method} ${req.path}`);
  next();
});

// ==================== ROUTES ====================

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
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
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: `🔐 ${SERVICE_NAME} is running`,
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      health: '/health',
      register: '/register',
      login: '/login',
      profile: '/profile',
    },
  });
});

// Endpoint d'inscription (placeholder)
app.post('/register', (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  // TODO: Validation et création utilisateur
  res.status(201).json({
    message: 'Endpoint register - à implémenter',
    data: { email, name },
  });
});

// Endpoint de connexion (placeholder)
app.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  // TODO: Validation et génération JWT
  res.json({
    message: 'Endpoint login - à implémenter',
    data: { email },
  });
});

// Endpoint profil utilisateur (placeholder)
app.get('/profile', (req: Request, res: Response) => {
  // TODO: Authentification JWT
  res.json({
    message: 'Endpoint profile - à implémenter',
  });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${SERVICE_NAME}] Error:`, err.stack);

  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ==================== SERVER STARTUP ====================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 ===================================`);
  console.log(`✅ [${SERVICE_NAME}] Server running`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Ready to accept requests!`);
  console.log(`=====================================\n`);
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log(`\n[${SERVICE_NAME}] Shutting down gracefully...`);

  server.close(() => {
    console.log(`[${SERVICE_NAME}] Server closed`);
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    console.error(`[${SERVICE_NAME}] Forced shutdown`);
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Unhandled errors
process.on('uncaughtException', (err: Error) => {
  console.error(`❌ [${SERVICE_NAME}] Uncaught Exception:`, err);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error(`❌ [${SERVICE_NAME}] Unhandled Rejection:`, reason);
  process.exit(1);
});

export default app;
