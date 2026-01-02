import type { Router } from 'express';
import express from 'express';
import { WorkspaceController } from '../controllers/workspaceController.js';
import { authenticateToken } from '../utils/auth.js';

const router = express.Router();

// All workspace routes require authentication
router.use(authenticateToken);

// Admin routes (must come before parameterized routes)
router.get('/admin/stats', WorkspaceController.getWorkspaceStats);
router.get('/admin/workspaces', WorkspaceController.getAllWorkspaces);
router.get('/admin/workspaces/:id', WorkspaceController.getWorkspaceByIdAdmin);
router.put('/admin/workspaces/:id', WorkspaceController.updateWorkspaceByIdAdmin);
router.delete('/admin/workspaces/:id', WorkspaceController.deleteWorkspaceByIdAdmin);
router.delete('/admin/workspaces/:id/hard', WorkspaceController.hardDeleteWorkspaceByIdAdmin);

// Create a new workspace
router.post('/', WorkspaceController.create);

// Join a workspace using invite code
router.post('/join', WorkspaceController.join);

// Get user's workspaces
router.get('/', WorkspaceController.getUserWorkspaces);

// Get specific workspace by ID
router.get('/:id', WorkspaceController.getById);

// Update workspace (owner/admin only)
router.put('/:id', WorkspaceController.update);

// Leave workspace (members only, not owners)
router.post('/:id/leave', WorkspaceController.leave);

// Delete workspace (owner only)
router.delete('/:id', WorkspaceController.delete);

// Column management
router.post('/:id/columns', WorkspaceController.addColumn);
router.put('/:id/columns/:columnId', WorkspaceController.updateColumn);
router.delete('/:id/columns/:columnId', WorkspaceController.deleteColumn);

export default router;
