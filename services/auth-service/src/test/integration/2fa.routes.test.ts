import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import speakeasy from 'speakeasy';
import Database from '../../config/database.js';
import { UserModel } from '../../models/User.js';
import { app } from '../../index.js';
import { JWTUtils } from '../../utils/jwt.js';

let mongoServer: MongoMemoryServer;

describe('2FA Routes Integration Tests', () => {
  let testUser: any;
  let testUserId: string;
  let authToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await Database.getInstance().connect(mongoUri);
    UserModel.initialize();
  });

  afterAll(async () => {
    await Database.getInstance().disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear users collection before each test
    const db = Database.getInstance();
    await db.getCollection('users').deleteMany({});

    // Create a test user
    const result = await UserModel.create({
      email: 'test@example.com',
      password: 'Password123!',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
    });

    testUser = result.data;
    testUserId = testUser._id.toString();

    // Generate auth token for authenticated routes
    authToken = JWTUtils.generateToken({
      userId: testUserId,
      email: testUser.email,
      role: testUser.role,
    });
  });

  // ==================== POST /setup-2fa ====================
  describe('POST /setup-2fa', () => {
    it('should return secret, QR code, and backup codes for valid user', async () => {
      const response = await request(app)
        .post('/setup-2fa')
        .send({ userId: testUserId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.secret).toBeDefined();
      expect(response.body.data.qrCode).toBeDefined();
      expect(response.body.data.backupCodes).toBeDefined();
      expect(response.body.data.backupCodes.length).toBe(10);
    });

    it('should return 400 if userId is missing', async () => {
      const response = await request(app)
        .post('/setup-2fa')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User ID is required');
    });

    it('should return 404 if user not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post('/setup-2fa')
        .send({ userId: fakeId });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  // ==================== POST /enable-2fa ====================
  describe('POST /enable-2fa', () => {
    it('should enable 2FA with valid token', async () => {
      // First, setup 2FA to get secret
      const setupResponse = await request(app)
        .post('/setup-2fa')
        .send({ userId: testUserId });

      const secret = setupResponse.body.data.secret;
      const backupCodes = setupResponse.body.data.backupCodes;

      // Generate valid TOTP token
      const validToken = speakeasy.totp({
        secret: secret,
        encoding: 'base32',
      });

      const response = await request(app)
        .post('/enable-2fa')
        .send({
          userId: testUserId,
          secret: secret,
          token: validToken,
          backupCodes: backupCodes,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('enabled');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/enable-2fa')
        .send({ userId: testUserId });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if TOTP token is invalid', async () => {
      const setupResponse = await request(app)
        .post('/setup-2fa')
        .send({ userId: testUserId });

      const secret = setupResponse.body.data.secret;
      const backupCodes = setupResponse.body.data.backupCodes;

      const response = await request(app)
        .post('/enable-2fa')
        .send({
          userId: testUserId,
          secret: secret,
          token: '000000', // Invalid token
          backupCodes: backupCodes,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should return 400 if user not found (validation first)', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post('/enable-2fa')
        .send({
          userId: fakeId,
          secret: 'JBSWY3DPEHPK3PXP',
          token: '123456',
          backupCodes: ['CODE1', 'CODE2'],
        });

      // API validates token before checking user existence
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // ==================== POST /verify-2fa ====================
  describe('POST /verify-2fa', () => {
    let secret: string;

    beforeEach(async () => {
      // Setup and enable 2FA for the user
      const setupResponse = await request(app)
        .post('/setup-2fa')
        .send({ userId: testUserId });

      secret = setupResponse.body.data.secret;
      const backupCodes = setupResponse.body.data.backupCodes;

      const validToken = speakeasy.totp({
        secret: secret,
        encoding: 'base32',
      });

      await request(app)
        .post('/enable-2fa')
        .send({
          userId: testUserId,
          secret: secret,
          token: validToken,
          backupCodes: backupCodes,
        });
    });

    it('should verify token and return JWT for valid 2FA', async () => {
      const validToken = speakeasy.totp({
        secret: secret,
        encoding: 'base32',
      });

      const response = await request(app)
        .post('/verify-2fa')
        .send({
          userId: testUserId,
          token: validToken,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
    });

    it('should return 400 if userId or token is missing', async () => {
      const response = await request(app)
        .post('/verify-2fa')
        .send({ userId: testUserId });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 if token is invalid', async () => {
      const response = await request(app)
        .post('/verify-2fa')
        .send({
          userId: testUserId,
          token: '000000',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if 2FA not enabled for user', async () => {
      // Create a new user without 2FA
      const newUserResult = await UserModel.create({
        email: 'no2fa@example.com',
        password: 'Password123!',
        username: 'no2fauser',
        firstName: 'No',
        lastName: 'TwoFA',
      });

      const response = await request(app)
        .post('/verify-2fa')
        .send({
          userId: newUserResult.data!._id.toString(),
          token: '123456',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // ==================== POST /disable-2fa ====================
  describe('POST /disable-2fa', () => {
    beforeEach(async () => {
      // Setup and enable 2FA for the user
      const setupResponse = await request(app)
        .post('/setup-2fa')
        .send({ userId: testUserId });

      const secret = setupResponse.body.data.secret;
      const backupCodes = setupResponse.body.data.backupCodes;

      const validToken = speakeasy.totp({
        secret: secret,
        encoding: 'base32',
      });

      await request(app)
        .post('/enable-2fa')
        .send({
          userId: testUserId,
          secret: secret,
          token: validToken,
          backupCodes: backupCodes,
        });
    });

    it('should disable 2FA with valid password', async () => {
      const response = await request(app)
        .post('/disable-2fa')
        .send({
          userId: testUserId,
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('disabled');
    });

    it('should return 400 if userId or password is missing', async () => {
      const response = await request(app)
        .post('/disable-2fa')
        .send({ userId: testUserId });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 if password is incorrect', async () => {
      const response = await request(app)
        .post('/disable-2fa')
        .send({
          userId: testUserId,
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 if user not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post('/disable-2fa')
        .send({
          userId: fakeId,
          password: 'Password123!',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  // ==================== POST /2fa/validate-login ====================
  describe('POST /2fa/validate-login', () => {
    let secret: string;
    let tempToken: string;

    beforeEach(async () => {
      // Setup and enable 2FA for the user
      const setupResponse = await request(app)
        .post('/setup-2fa')
        .send({ userId: testUserId });

      secret = setupResponse.body.data.secret;
      const backupCodes = setupResponse.body.data.backupCodes;

      const validToken = speakeasy.totp({
        secret: secret,
        encoding: 'base32',
      });

      await request(app)
        .post('/enable-2fa')
        .send({
          userId: testUserId,
          secret: secret,
          token: validToken,
          backupCodes: backupCodes,
        });

      // Generate temp token (simulating login that requires 2FA)
      tempToken = JWTUtils.generateToken({
        userId: testUserId,
        type: '2fa-pending',
      });
    });

    it('should complete login with valid tempToken and 2FA code', async () => {
      const validToken = speakeasy.totp({
        secret: secret,
        encoding: 'base32',
      });

      const response = await request(app)
        .post('/2fa/validate-login')
        .send({
          tempToken: tempToken,
          token: validToken,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
    });

    it('should return 400 if tokens are missing', async () => {
      const response = await request(app)
        .post('/2fa/validate-login')
        .send({ tempToken: tempToken });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 if tempToken is invalid', async () => {
      const response = await request(app)
        .post('/2fa/validate-login')
        .send({
          tempToken: 'invalid.token.here',
          token: '123456',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 if 2FA code is invalid', async () => {
      const response = await request(app)
        .post('/2fa/validate-login')
        .send({
          tempToken: tempToken,
          token: '000000',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
