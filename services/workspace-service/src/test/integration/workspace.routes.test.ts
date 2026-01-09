import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import Database from '../../config/database.js';
import { WorkspaceModel } from '../../models/Workspace.js';
import { WorkspaceController } from '../../controllers/workspaceController.js';
import { ObjectId } from 'mongodb';
import * as auth from '../../utils/auth.js';
import { app } from '../../index.js';

let mongoServer: MongoMemoryServer;

jest.mock('../../utils/auth.js', () => ({
  ...jest.requireActual('../../utils/auth.js'),
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { userId: new ObjectId().toHexString(), email: 'test@test.com', role: 'user' };
    next();
  }),
}));

describe('Workspace Service Routes', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await Database.getInstance().connect(mongoUri);
    WorkspaceModel.initialize();
  });

  afterAll(async () => {
    await Database.getInstance().disconnect();
    await mongoServer.stop();
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    // Mock the enrichMembersWithUserDetails to avoid DB calls to users collection
    jest
      .spyOn(WorkspaceController, 'enrichMembersWithUserDetails' as any)
      .mockImplementation((workspace) => Promise.resolve(workspace));

    // Clear all workspaces before each test
    await WorkspaceModel.collection.deleteMany({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 for the health check endpoint', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('POST /', () => {
    it('should create a new workspace', async () => {
      const response = await request(app)
        .post('/')
        .send({ name: 'Test Workspace', description: 'A test workspace' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.workspace.name).toBe('Test Workspace');
      expect(response.body.data.workspace.description).toBe('A test workspace');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app).post('/').send({ description: 'A test workspace' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Workspace name must be at least 3 characters long');
    });
  });
  describe('GET /', () => {
    it("should return the user's workspaces", async () => {
      const userId = new ObjectId().toHexString();
      (auth.authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { userId };
        next();
      });

      await WorkspaceModel.create({
        name: 'My Workspace',
        ownerId: userId,
        members: [{ userId, role: 'owner', joinedAt: new Date(), isActive: true }],
      });

      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.workspaces.length).toBe(1);
      expect(response.body.data.workspaces[0].name).toBe('My Workspace');
    });

    it('should return an empty array if the user has no workspaces', async () => {
      const otherUserId = new ObjectId().toHexString();
      (auth.authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { userId: otherUserId };
        next();
      });

      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.workspaces.length).toBe(0);
    });
  });
});
