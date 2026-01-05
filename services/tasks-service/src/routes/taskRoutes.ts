import { Router } from 'express';
import { authenticateToken } from '../utils/auth.js';
import * as taskController from '../controllers/taskController.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Task CRUD routes
router.get('/', taskController.getTasks);
router.get('/stats', taskController.getTaskStats);
router.get('/workspace/:workspaceId', taskController.getTasksByWorkspace);
router.get('/:id', taskController.getTask);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.patch('/:id/column', taskController.updateTaskColumn);
router.delete('/:id', taskController.deleteTask);

export default router;
