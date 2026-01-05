import { Db, Collection, ObjectId } from 'mongodb';
import Database from '../config/database.js';
import type { Task, TaskResponse } from '../types/Task.js';

export class TaskModel {
    private static db: Db;
    private static collection: Collection<Task>;

    static initialize() {
        const database = Database.getInstance();
        TaskModel.db = database.getDb();
        TaskModel.collection = TaskModel.db.collection<Task>('tasks');
    }

    /**
     * Create a new task
     */
    static async create(taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt' | 'isActive'>): Promise<TaskResponse> {
        const task: Task = {
            ...taskData,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
        };

        const result = await TaskModel.collection.insertOne(task);

        if (!result.insertedId) {
            throw new Error('Failed to create task');
        }

        const created = await TaskModel.findById(result.insertedId.toString());
        if (!created) {
            throw new Error('Failed to retrieve created task');
        }

        return created;
    }

    /**
     * Find task by ID
     */
    static async findById(id: string): Promise<TaskResponse | null> {
        try {
            const objectId = new ObjectId(id);
            const task = await TaskModel.collection.findOne({ _id: objectId, isActive: true });

            if (!task) {
                return null;
            }

            return TaskModel.toResponse(task);
        } catch (error) {
            console.error('Error finding task by ID:', error);
            return null;
        }
    }

    /**
     * Find all tasks for a user
     */
    static async findByUserId(userId: string): Promise<TaskResponse[]> {
        try {
            const tasks = await TaskModel.collection
                .find({ assignedTo: userId, isActive: true })
                .sort({ createdAt: -1 })
                .toArray();

            return tasks.map((task) => TaskModel.toResponse(task));
        } catch (error) {
            console.error('Error finding tasks by user ID:', error);
            return [];
        }
    }

    /**
     * Find all tasks in a workspace
     */
    static async findByWorkspaceId(workspaceId: string): Promise<TaskResponse[]> {
        try {
            const tasks = await TaskModel.collection
                .find({ workspaceId, isActive: true })
                .sort({ createdAt: -1 })
                .toArray();

            return tasks.map((task) => TaskModel.toResponse(task));
        } catch (error) {
            console.error('Error finding tasks by workspace ID:', error);
            return [];
        }
    }

    /**
     * Find tasks by user and optionally filter by workspace
     */
    static async findByUserAndWorkspace(
        userId: string,
        workspaceId?: string
    ): Promise<TaskResponse[]> {
        try {
            const query: any = { assignedTo: userId, isActive: true };

            if (workspaceId) {
                query.workspaceId = workspaceId;
            }

            const tasks = await TaskModel.collection
                .find(query)
                .sort({ createdAt: -1 })
                .toArray();

            return tasks.map((task) => TaskModel.toResponse(task));
        } catch (error) {
            console.error('Error finding tasks by user and workspace:', error);
            return [];
        }
    }

    /**
     * Update a task
     */
    static async update(id: string, userId: string, updateData: Partial<Task>): Promise<TaskResponse | null> {
        try {
            const objectId = new ObjectId(id);

            // Remove fields that shouldn't be updated directly
            const { _id, createdAt, createdBy, isActive, ...safeUpdateData } = updateData as any;

            const result = await TaskModel.collection.updateOne(
                { _id: objectId, assignedTo: userId, isActive: true },
                {
                    $set: {
                        ...safeUpdateData,
                        updatedAt: new Date(),
                    },
                }
            );

            if (result.modifiedCount === 0) {
                return null;
            }

            return await TaskModel.findById(id);
        } catch (error) {
            console.error('Error updating task:', error);
            return null;
        }
    }

    /**
     * Update task column (for drag & drop)
     */
    static async updateColumn(
        id: string,
        userId: string,
        columnId: string,
        columnName: string
    ): Promise<TaskResponse | null> {
        try {
            const objectId = new ObjectId(id);

            const result = await TaskModel.collection.updateOne(
                { _id: objectId, assignedTo: userId, isActive: true },
                {
                    $set: {
                        columnId,
                        columnName,
                        status: columnName,
                        updatedAt: new Date(),
                        // Mark as completed if moved to a "Terminé" column
                        ...(columnName.toLowerCase().includes('terminé') && {
                            completedAt: new Date(),
                        }),
                    },
                }
            );

            if (result.modifiedCount === 0) {
                return null;
            }

            return await TaskModel.findById(id);
        } catch (error) {
            console.error('Error updating task column:', error);
            return null;
        }
    }

    /**
     * Delete task (soft delete)
     */
    static async delete(id: string, userId: string): Promise<boolean> {
        try {
            const objectId = new ObjectId(id);

            const result = await TaskModel.collection.updateOne(
                { _id: objectId, assignedTo: userId },
                {
                    $set: {
                        isActive: false,
                        updatedAt: new Date(),
                    },
                }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            console.error('Error deleting task:', error);
            return false;
        }
    }

    /**
     * Hard delete task (permanent deletion - admin only)
     */
    static async hardDelete(id: string): Promise<boolean> {
        try {
            const objectId = new ObjectId(id);

            const result = await TaskModel.collection.deleteOne({ _id: objectId });

            return result.deletedCount > 0;
        } catch (error) {
            console.error('Error hard deleting task:', error);
            return false;
        }
    }

    /**
     * Get task statistics for a user
     */
    static async getStats(userId: string): Promise<{
        total: number;
        completed: number;
        inProgress: number;
        todo: number;
        overdue: number;
    }> {
        try {
            const tasks = await TaskModel.findByUserId(userId);
            const today = new Date().toISOString().split('T')[0];

            return {
                total: tasks.length,
                completed: tasks.filter((t) => t.columnName.toLowerCase().includes('terminé')).length,
                inProgress: tasks.filter((t) => t.columnName.toLowerCase().includes('cours')).length,
                todo: tasks.filter((t) => t.columnName.toLowerCase().includes('faire')).length,
                overdue: tasks.filter((t) => {
                    return t.dueDate < today && !t.columnName.toLowerCase().includes('terminé');
                }).length,
            };
        } catch (error) {
            console.error('Error getting task stats:', error);
            return { total: 0, completed: 0, inProgress: 0, todo: 0, overdue: 0 };
        }
    }

    /**
     * Convert database document to response format
     */
    private static toResponse(task: Task): TaskResponse {
        return {
            _id: task._id?.toString() || '',
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
            status: task.status,
            columnId: task.columnId,
            columnName: task.columnName,
            workspaceId: task.workspaceId,
            assignedTo: task.assignedTo,
            createdBy: task.createdBy,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            isActive: task.isActive,
            completedAt: task.completedAt,
        };
    }
}
