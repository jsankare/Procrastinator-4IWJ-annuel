import type { Response } from 'express';
import type { AuthRequest } from '../utils/auth.js';
import { TaskModel } from '../models/Task.js';

/**
 * Get all tasks for the authenticated user
 */
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'User not authenticated',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        const { workspaceId } = req.query;

        const tasks = await TaskModel.findByUserAndWorkspace(
            req.user.userId,
            workspaceId as string | undefined
        );

        res.json({
            success: true,
            data: { tasks },
            count: tasks.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to fetch tasks',
            timestamp: new Date().toISOString(),
        });
    }
};

/**
 * Get tasks by workspace
 */
export const getTasksByWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'User not authenticated',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        const { workspaceId } = req.params;

        const tasks = await TaskModel.findByWorkspaceId(workspaceId);

        res.json({
            success: true,
            data: { tasks },
            count: tasks.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching workspace tasks:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to fetch workspace tasks',
            timestamp: new Date().toISOString(),
        });
    }
};

/**
 * Get a single task by ID
 */
export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'User not authenticated',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        const { id } = req.params;
        const task = await TaskModel.findById(id);

        if (!task) {
            res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Task not found',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        // Check if user has access to this task
        if (task.assignedTo !== req.user.userId) {
            res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Access denied',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        res.json({
            success: true,
            data: { task },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to fetch task',
            timestamp: new Date().toISOString(),
        });
    }
};

/**
 * Create a new task
 */
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'User not authenticated',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        const { title, description, dueDate, priority, columnId, columnName, workspaceId } = req.body;

        // Validation
        if (!title || !description || !dueDate || !priority || !columnName) {
            res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'Missing required fields: title, description, dueDate, priority, columnName',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        if (!['low', 'medium', 'high'].includes(priority)) {
            res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'Invalid priority. Must be: low, medium, or high',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        const task = await TaskModel.create({
            title,
            description,
            dueDate,
            priority,
            status: columnName,
            columnId,
            columnName,
            workspaceId,
            assignedTo: req.user.userId,
            createdBy: req.user.userId,
        });

        res.status(201).json({
            success: true,
            data: { task },
            message: 'Task created successfully',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error creating task:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            user: req.user?.userId,
            body: req.body,
        });
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Failed to create task',
            timestamp: new Date().toISOString(),
            ...(process.env.NODE_ENV === 'development' && {
                stack: error instanceof Error ? error.stack : undefined,
                body: req.body
            }),
        });
    }
};

/**
 * Update a task
 */
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'User not authenticated',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        const { id } = req.params;
        const updateData = req.body;

        const task = await TaskModel.update(id, req.user.userId, updateData);

        if (!task) {
            res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Task not found or access denied',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        res.json({
            success: true,
            data: { task },
            message: 'Task updated successfully',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to update task',
            timestamp: new Date().toISOString(),
        });
    }
};

/**
 * Update task column (for drag & drop)
 */
export const updateTaskColumn = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'User not authenticated',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        const { id } = req.params;
        const { columnId, columnName } = req.body;

        if (!columnName) {
            res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'columnName is required',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        const task = await TaskModel.updateColumn(id, req.user.userId, columnId, columnName);

        if (!task) {
            res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Task not found or access denied',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        res.json({
            success: true,
            data: { task },
            message: 'Task column updated successfully',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error updating task column:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to update task column',
            timestamp: new Date().toISOString(),
        });
    }
};

/**
 * Delete a task
 */
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'User not authenticated',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        const { id } = req.params;
        const success = await TaskModel.delete(id, req.user.userId);

        if (!success) {
            res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Task not found or access denied',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        res.json({
            success: true,
            message: 'Task deleted successfully',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to delete task',
            timestamp: new Date().toISOString(),
        });
    }
};

/**
 * Get task statistics
 */
export const getTaskStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'User not authenticated',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        const stats = await TaskModel.getStats(req.user.userId);

        res.json({
            success: true,
            data: { stats },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching task stats:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to fetch task statistics',
            timestamp: new Date().toISOString(),
        });
    }
};
