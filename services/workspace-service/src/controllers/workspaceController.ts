import type { Request, Response } from 'express';
import { WorkspaceModel } from '../models/Workspace.js';
import type { CreateWorkspaceRequest, JoinWorkspaceRequest } from '../types/Workspace.js';
import { MongoClient, Db, ObjectId } from 'mongodb';
import Database from '../config/database.js';
import { JWTUtils } from '../utils/jwt.js';

export class WorkspaceController {
  /**
   * Enrich workspace members with user details
   */
  private static async enrichMembersWithUserDetails(workspace: any): Promise<any> {
    try {
      const database = Database.getInstance();
      const db = database.getDb();
      const usersCollection = db.collection('users');

      const userIds = workspace.members.map((member: any) => member.userId);
      const users = await usersCollection
        .find(
          { _id: { $in: userIds.map((id: string) => new ObjectId(id)) } },
          { projection: { username: 1, firstName: 1, lastName: 1, email: 1, 'profile.avatar': 1 } },
        )
        .toArray();

      const enrichedMembers = workspace.members.map((member: any) => {
        const user = users.find((u: any) => u._id.toString() === member.userId);
        return {
          ...member,
          username: user?.username,
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          avatar: user?.profile?.avatar || null,
        };
      });

      return {
        ...workspace,
        members: enrichedMembers,
      };
    } catch (error) {
      console.error('Error enriching members with user details:', error);
      return workspace; // Return original if enrichment fails
    }
  }

  /**
   * Create a new workspace
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body as CreateWorkspaceRequest;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validation
      if (!name || typeof name !== 'string' || name.trim().length < 3) {
        res.status(400).json({
          success: false,
          error: 'Workspace name must be at least 3 characters long',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (name.trim().length > 100) {
        res.status(400).json({
          success: false,
          error: 'Workspace name cannot exceed 100 characters',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (description && description.length > 500) {
        res.status(400).json({
          success: false,
          error: 'Workspace description cannot exceed 500 characters',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Create workspace
      const workspace = await WorkspaceModel.create({
        name: name.trim(),
        description: description?.trim() || undefined,
        ownerId: userId,
        members: [
          {
            userId,
            role: 'owner',
            joinedAt: new Date(),
            isActive: true,
          },
        ],
      });

      // Enrich with user details
      const enrichedWorkspace = await WorkspaceController.enrichMembersWithUserDetails(workspace);

      res.status(201).json({
        success: true,
        message: 'Workspace created successfully',
        data: { workspace: enrichedWorkspace },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error creating workspace:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create workspace',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Join a workspace using invite code
   */
  static async join(req: Request, res: Response): Promise<void> {
    try {
      const { inviteCode } = req.body as JoinWorkspaceRequest;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validation
      if (!inviteCode || typeof inviteCode !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invite code is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Normalize invite code
      const normalizedCode = inviteCode.trim().toUpperCase();
      if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalizedCode)) {
        res.status(400).json({
          success: false,
          error: 'Invalid invite code format. Expected format: XXXX-XXXX',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Find workspace by invite code
      const workspace = await WorkspaceModel.findByInviteCode(normalizedCode);
      if (!workspace) {
        res.status(404).json({
          success: false,
          error: 'Workspace not found or invite code is invalid',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if user is already a member
      const isMember = await WorkspaceModel.isMember(workspace._id, userId);
      if (isMember) {
        res.status(409).json({
          success: false,
          error: 'You are already a member of this workspace',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Add user to workspace
      const success = await WorkspaceModel.addMember(workspace._id, userId, 'member');
      if (!success) {
        res.status(500).json({
          success: false,
          error: 'Failed to join workspace',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Get updated workspace
      const updatedWorkspace = await WorkspaceModel.findById(workspace._id);
      if (!updatedWorkspace) {
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve updated workspace',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Enrich with user details
      const enrichedWorkspace =
        await WorkspaceController.enrichMembersWithUserDetails(updatedWorkspace);
      const member = enrichedWorkspace.members.find((m: any) => m.userId === userId);

      res.status(200).json({
        success: true,
        message: 'Successfully joined workspace',
        data: {
          workspace: enrichedWorkspace,
          member,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error joining workspace:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to join workspace',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get user's workspaces
   */
  static async getUserWorkspaces(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const workspaces = await WorkspaceModel.findByUserId(userId);

      // Enrich all workspaces with user details
      const enrichedWorkspaces = await Promise.all(
        workspaces.map((workspace) => WorkspaceController.enrichMembersWithUserDetails(workspace)),
      );

      res.status(200).json({
        success: true,
        message: 'Workspaces retrieved successfully',
        data: {
          workspaces: enrichedWorkspaces,
          total: enrichedWorkspaces.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error getting user workspaces:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve workspaces',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get workspace by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!id || id.length !== 24) {
        res.status(400).json({
          success: false,
          error: 'Invalid workspace ID',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const workspace = await WorkspaceModel.findById(id);
      if (!workspace) {
        res.status(404).json({
          success: false,
          error: 'Workspace not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if user is a member
      const isMember = await WorkspaceModel.isMember(id, userId);
      if (!isMember) {
        res.status(403).json({
          success: false,
          error: 'You do not have access to this workspace',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Enrich with user details
      const enrichedWorkspace = await WorkspaceController.enrichMembersWithUserDetails(workspace);

      res.status(200).json({
        success: true,
        message: 'Workspace retrieved successfully',
        data: { workspace: enrichedWorkspace },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error getting workspace:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve workspace',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Update workspace
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!id || id.length !== 24) {
        res.status(400).json({
          success: false,
          error: 'Invalid workspace ID',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if user has permission (owner or admin)
      const memberRole = await WorkspaceModel.getMemberRole(id, userId);
      if (!memberRole || (memberRole !== 'owner' && memberRole !== 'admin')) {
        res.status(403).json({
          success: false,
          error: 'You do not have permission to update this workspace',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const updateData: any = {};

      if (name !== undefined) {
        if (!name || typeof name !== 'string' || name.trim().length < 3) {
          res.status(400).json({
            success: false,
            error: 'Workspace name must be at least 3 characters long',
            timestamp: new Date().toISOString(),
          });
          return;
        }
        if (name.trim().length > 100) {
          res.status(400).json({
            success: false,
            error: 'Workspace name cannot exceed 100 characters',
            timestamp: new Date().toISOString(),
          });
          return;
        }
        updateData.name = name.trim();
      }

      if (description !== undefined) {
        if (description && description.length > 500) {
          res.status(400).json({
            success: false,
            error: 'Workspace description cannot exceed 500 characters',
            timestamp: new Date().toISOString(),
          });
          return;
        }
        updateData.description = description?.trim() || undefined;
      }

      const updatedWorkspace = await WorkspaceModel.update(id, updateData);
      if (!updatedWorkspace) {
        res.status(404).json({
          success: false,
          error: 'Workspace not found or no changes made',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Enrich with user details
      const enrichedWorkspace =
        await WorkspaceController.enrichMembersWithUserDetails(updatedWorkspace);

      res.status(200).json({
        success: true,
        message: 'Workspace updated successfully',
        data: { workspace: enrichedWorkspace },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating workspace:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update workspace',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Leave workspace
   */
  static async leave(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!id || id.length !== 24) {
        res.status(400).json({
          success: false,
          error: 'Invalid workspace ID',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if user is a member
      const memberRole = await WorkspaceModel.getMemberRole(id, userId);
      if (!memberRole) {
        res.status(404).json({
          success: false,
          error: 'You are not a member of this workspace',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Owners cannot leave their own workspace
      if (memberRole === 'owner') {
        res.status(400).json({
          success: false,
          error:
            'Workspace owners cannot leave. Transfer ownership or delete the workspace instead.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const success = await WorkspaceModel.removeMember(id, userId);
      if (!success) {
        res.status(500).json({
          success: false,
          error: 'Failed to leave workspace',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Successfully left workspace',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error leaving workspace:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to leave workspace',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Delete workspace (owner only)
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!id || id.length !== 24) {
        res.status(400).json({
          success: false,
          error: 'Invalid workspace ID',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if user is the owner
      const memberRole = await WorkspaceModel.getMemberRole(id, userId);
      if (memberRole !== 'owner') {
        res.status(403).json({
          success: false,
          error: 'Only workspace owners can delete workspaces',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const success = await WorkspaceModel.delete(id);
      if (!success) {
        res.status(500).json({
          success: false,
          error: 'Failed to delete workspace',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Workspace deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error deleting workspace:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete workspace',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Add column to workspace
   */
  static async addColumn(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, color } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!id || id.length !== 24) {
        res.status(400).json({
          success: false,
          error: 'Invalid workspace ID',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if user has permission (owner or admin)
      const memberRole = await WorkspaceModel.getMemberRole(id, userId);
      if (!memberRole || (memberRole !== 'owner' && memberRole !== 'admin')) {
        res.status(403).json({
          success: false,
          error: 'You do not have permission to add columns to this workspace',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validation
      if (!name || typeof name !== 'string' || name.trim().length < 1) {
        res.status(400).json({
          success: false,
          error: 'Column name is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (name.trim().length > 50) {
        res.status(400).json({
          success: false,
          error: 'Column name cannot exceed 50 characters',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Get current workspace to determine next position
      const workspace = await WorkspaceModel.findById(id);
      if (!workspace) {
        res.status(404).json({
          success: false,
          error: 'Workspace not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const nextPosition = workspace.columns.length;
      const newColumn = {
        _id: new ObjectId().toString(),
        name: name.trim(),
        color: color || '#64748b',
        position: nextPosition,
        createdAt: new Date(),
        isActive: true,
      };

      // Add the column directly using MongoDB collection
      const result = await WorkspaceModel.collection.updateOne(
        { _id: new ObjectId(id), isActive: true },
        { $push: { columns: newColumn }, $set: { updatedAt: new Date() } },
      );

      if (result.modifiedCount === 0) {
        res.status(500).json({
          success: false,
          error: 'Failed to add column',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const updatedWorkspace = await WorkspaceModel.findById(id);
      if (!updatedWorkspace) {
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve updated workspace',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Enrich with user details
      const enrichedWorkspace =
        await WorkspaceController.enrichMembersWithUserDetails(updatedWorkspace);

      res.status(200).json({
        success: true,
        message: 'Column added successfully',
        data: { workspace: enrichedWorkspace, column: newColumn },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error adding column:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add column',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Update column in workspace
   */
  static async updateColumn(req: Request, res: Response): Promise<void> {
    try {
      const { id, columnId } = req.params;
      const { name, color, position } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!id || id.length !== 24) {
        res.status(400).json({
          success: false,
          error: 'Invalid workspace ID',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if user has permission (owner or admin)
      const memberRole = await WorkspaceModel.getMemberRole(id, userId);
      if (!memberRole || (memberRole !== 'owner' && memberRole !== 'admin')) {
        res.status(403).json({
          success: false,
          error: 'You do not have permission to update columns in this workspace',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Build update object for the specific column
      const updateFields: any = {};
      if (name !== undefined) {
        if (!name || typeof name !== 'string' || name.trim().length < 1) {
          res.status(400).json({
            success: false,
            error: 'Column name is required',
            timestamp: new Date().toISOString(),
          });
          return;
        }
        updateFields['columns.$.name'] = name.trim();
      }
      if (color !== undefined) {
        updateFields['columns.$.color'] = color;
      }
      if (position !== undefined) {
        updateFields['columns.$.position'] = position;
      }
      updateFields['columns.$.updatedAt'] = new Date();

      const result = await WorkspaceModel.collection.updateOne(
        { _id: new ObjectId(id), 'columns._id': columnId, isActive: true },
        { $set: updateFields },
      );

      if (result.modifiedCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Column not found or no changes made',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const updatedWorkspace = await WorkspaceModel.findById(id);
      if (!updatedWorkspace) {
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve updated workspace',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Enrich with user details
      const enrichedWorkspace =
        await WorkspaceController.enrichMembersWithUserDetails(updatedWorkspace);

      res.status(200).json({
        success: true,
        message: 'Column updated successfully',
        data: { workspace: enrichedWorkspace },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating column:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update column',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Delete column from workspace
   */
  static async deleteColumn(req: Request, res: Response): Promise<void> {
    try {
      const { id, columnId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!id || id.length !== 24) {
        res.status(400).json({
          success: false,
          error: 'Invalid workspace ID',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if user has permission (owner or admin)
      const memberRole = await WorkspaceModel.getMemberRole(id, userId);
      if (!memberRole || (memberRole !== 'owner' && memberRole !== 'admin')) {
        res.status(403).json({
          success: false,
          error: 'You do not have permission to delete columns from this workspace',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await WorkspaceModel.collection.updateOne(
        { _id: new ObjectId(id), isActive: true },
        { $pull: { columns: { _id: columnId } } },
      );

      if (result.modifiedCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Column not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const updatedWorkspace = await WorkspaceModel.findById(id);
      if (!updatedWorkspace) {
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve updated workspace',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Enrich with user details
      const enrichedWorkspace =
        await WorkspaceController.enrichMembersWithUserDetails(updatedWorkspace);

      res.status(200).json({
        success: true,
        message: 'Column deleted successfully',
        data: { workspace: enrichedWorkspace },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error deleting column:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete column',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get all workspaces (Admin only)
   * GET /admin/workspaces
   */
  static async getAllWorkspaces(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Authorization token required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const token = authHeader.substring(7);
      const payload = JWTUtils.verifyToken(token);

      if (!payload || payload.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin access required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const workspaces = await WorkspaceModel.getAllWorkspaces(page, limit);

      res.status(200).json({
        success: true,
        data: workspaces,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error getting all workspaces:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get workspaces',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get workspace by ID (Admin only)
   * GET /admin/workspaces/:id
   */
  static async getWorkspaceByIdAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid workspace ID',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Authorization token required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const token = authHeader.substring(7);
      const payload = JWTUtils.verifyToken(token);

      if (!payload || payload.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin access required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const workspace = await WorkspaceModel.findByIdAdmin(id);

      if (!workspace) {
        res.status(404).json({
          success: false,
          error: 'Workspace not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Enrich with user details
      const enrichedWorkspace = await WorkspaceController.enrichMembersWithUserDetails(workspace);

      res.status(200).json({
        success: true,
        data: { workspace: enrichedWorkspace },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error getting workspace by ID (admin):', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get workspace',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Update workspace by ID (Admin only)
   * PUT /admin/workspaces/:id
   */
  static async updateWorkspaceByIdAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid workspace ID',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Authorization token required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const token = authHeader.substring(7);
      const payload = JWTUtils.verifyToken(token);

      if (!payload || payload.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin access required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const updatedWorkspace = await WorkspaceModel.updateAdmin(id, updateData);

      if (!updatedWorkspace) {
        res.status(404).json({
          success: false,
          error: 'Workspace not found or update failed',
          timestamp: new Date().toISOString(),
        });
        return;
      }
      const enrichedWorkspace =
        await WorkspaceController.enrichMembersWithUserDetails(updatedWorkspace);

      res.status(200).json({
        success: true,
        message: 'Workspace updated successfully',
        data: { workspace: enrichedWorkspace },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating workspace by ID (admin):', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update workspace',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Delete workspace by ID (Admin only) - Soft Delete
   * DELETE /admin/workspaces/:id
   */
  static async deleteWorkspaceByIdAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid workspace ID',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Authorization token required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const token = authHeader.substring(7);
      const payload = JWTUtils.verifyToken(token);

      if (!payload || payload.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin access required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const success = await WorkspaceModel.delete(id);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Workspace not found or delete failed',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Workspace deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error deleting workspace by ID (admin):', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete workspace',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Hard delete workspace by ID (Admin only)
   * DELETE /admin/workspaces/:id/hard
   */
  static async hardDeleteWorkspaceByIdAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid workspace ID',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Authorization token required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const token = authHeader.substring(7);
      const payload = JWTUtils.verifyToken(token);

      if (!payload || payload.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin access required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const success = await WorkspaceModel.hardDelete(id);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Workspace not found or hard delete failed',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Workspace permanently deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error hard deleting workspace by ID (admin):', error);
      res.status(500).json({
        success: false,
        error: 'Failed to hard delete workspace',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get workspace statistics (Admin only)
   * GET /admin/workspaces/stats
   */
  static async getWorkspaceStats(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Authorization token required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const token = authHeader.substring(7);
      const payload = JWTUtils.verifyToken(token);

      if (!payload || payload.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin access required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const stats = await WorkspaceModel.getWorkspaceStats();

      res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error getting workspace stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get workspace statistics',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
