import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import Database from '../config/database.js';
import type {
  Workspace,
  WorkspaceMember,
  WorkspaceColumn,
  WorkspaceResponse,
  WorkspaceMemberResponse,
} from '../types/Workspace.js';

export class WorkspaceModel {
  private static db: Db;
  private static collection: Collection<Workspace>;

  static initialize() {
    const database = Database.getInstance();
    WorkspaceModel.db = database.getDb();
    WorkspaceModel.collection = WorkspaceModel.db.collection<Workspace>('workspaces');
  }

  /**
   * Generate a unique invite code in format XXXX-XXXX
   */
  static generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      if (i === 4) result += '-';
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Create default columns for a new workspace
   */
  static createDefaultColumns(): WorkspaceColumn[] {
    const defaultColumns = [
      { name: 'À faire', color: '#64748b', position: 0 },
      { name: 'En cours', color: '#f59e0b', position: 1 },
      { name: 'Terminé', color: '#10b981', position: 2 },
    ];

    return defaultColumns.map((col) => ({
      _id: new ObjectId().toString(),
      name: col.name,
      color: col.color,
      position: col.position,
      createdAt: new Date(),
      isActive: true,
    }));
  }

  /**
   * Ensure invite code is unique
   */
  static async ensureUniqueInviteCode(): Promise<string> {
    let inviteCode: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      inviteCode = WorkspaceModel.generateInviteCode();
      const existing = await WorkspaceModel.collection.findOne({ inviteCode });
      isUnique = !existing;
      attempts++;
    } while (!isUnique && attempts < maxAttempts);

    if (!isUnique) {
      throw new Error('Unable to generate unique invite code');
    }

    return inviteCode;
  }

  /**
   * Create a new workspace
   */
  static async create(
    workspaceData: Omit<
      Workspace,
      '_id' | 'inviteCode' | 'columns' | 'createdAt' | 'updatedAt' | 'isActive'
    >,
  ): Promise<WorkspaceResponse> {
    const inviteCode = await WorkspaceModel.ensureUniqueInviteCode();

    const workspace: Workspace = {
      ...workspaceData,
      inviteCode,
      columns: WorkspaceModel.createDefaultColumns(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    const result = await WorkspaceModel.collection.insertOne(workspace);

    if (!result.insertedId) {
      throw new Error('Failed to create workspace');
    }

    const created = await WorkspaceModel.findById(result.insertedId.toString());
    if (!created) {
      throw new Error('Failed to retrieve created workspace');
    }

    return created;
  }

  /**
   * Find workspace by ID
   */
  static async findById(id: string): Promise<WorkspaceResponse | null> {
    try {
      const objectId = new ObjectId(id);
      const workspace = await WorkspaceModel.collection.findOne({ _id: objectId, isActive: true });

      if (!workspace) {
        return null;
      }

      // Auto-migrate columns if missing
      if (!workspace.columns || workspace.columns.length === 0) {
        const defaultColumns = WorkspaceModel.createDefaultColumns();
        await WorkspaceModel.collection.updateOne(
          { _id: objectId },
          {
            $set: {
              columns: defaultColumns,
              updatedAt: new Date(),
            },
          },
        );
        workspace.columns = defaultColumns;
      }

      return WorkspaceModel.toResponse(workspace);
    } catch (error) {
      console.error('Error finding workspace by ID:', error);
      return null;
    }
  }

  /**
   * Find workspace by ID (Admin only - includes inactive workspaces)
   */
  static async findByIdAdmin(id: string): Promise<WorkspaceResponse | null> {
    try {
      const objectId = new ObjectId(id);
      const workspace = await WorkspaceModel.collection.findOne({ _id: objectId });

      if (!workspace) {
        return null;
      }

      // Auto-migrate columns if missing
      if (!workspace.columns || workspace.columns.length === 0) {
        const defaultColumns = WorkspaceModel.createDefaultColumns();
        await WorkspaceModel.collection.updateOne(
          { _id: objectId },
          {
            $set: {
              columns: defaultColumns,
              updatedAt: new Date(),
            },
          },
        );
        workspace.columns = defaultColumns;
      }

      return WorkspaceModel.toResponse(workspace);
    } catch (error) {
      console.error('Error finding workspace by ID (admin):', error);
      return null;
    }
  }

  /**
   * Find workspace by invite code
   */
  static async findByInviteCode(inviteCode: string): Promise<WorkspaceResponse | null> {
    try {
      const workspace = await WorkspaceModel.collection.findOne({
        inviteCode: inviteCode.toUpperCase(),
        isActive: true,
      });

      if (!workspace) {
        return null;
      }

      return WorkspaceModel.toResponse(workspace);
    } catch (error) {
      console.error('Error finding workspace by invite code:', error);
      return null;
    }
  }

  /**
   * Find workspaces where user is a member
   */
  static async findByUserId(userId: string): Promise<WorkspaceResponse[]> {
    try {
      const workspaces = await WorkspaceModel.collection
        .find({
          'members.userId': userId,
          'members.isActive': true,
          isActive: true,
        })
        .toArray();

      // Auto-migrate columns for workspaces that don't have them
      const migratedWorkspaces = await Promise.all(
        workspaces.map(async (ws) => {
          if (!ws.columns || ws.columns.length === 0) {
            const defaultColumns = WorkspaceModel.createDefaultColumns();
            await WorkspaceModel.collection.updateOne(
              { _id: ws._id },
              {
                $set: {
                  columns: defaultColumns,
                  updatedAt: new Date(),
                },
              },
            );
            ws.columns = defaultColumns;
          }
          return ws;
        }),
      );

      return migratedWorkspaces.map((ws) => WorkspaceModel.toResponse(ws));
    } catch (error) {
      console.error('Error finding workspaces by user ID:', error);
      return [];
    }
  }

  /**
   * Add member to workspace
   */
  static async addMember(
    workspaceId: string,
    userId: string,
    role: 'owner' | 'admin' | 'member' = 'member',
  ): Promise<boolean> {
    try {
      const objectId = new ObjectId(workspaceId);

      // Check if user is already a member
      const workspace = await WorkspaceModel.collection.findOne({
        _id: objectId,
        'members.userId': userId,
      });

      if (workspace) {
        // User is already a member, just activate if inactive
        const result = await WorkspaceModel.collection.updateOne(
          { _id: objectId, 'members.userId': userId },
          {
            $set: {
              'members.$.isActive': true,
              updatedAt: new Date(),
            },
          },
        );
        return result.modifiedCount > 0;
      }

      // Add new member
      const newMember: WorkspaceMember = {
        userId,
        role,
        joinedAt: new Date(),
        isActive: true,
      };

      const result = await WorkspaceModel.collection.updateOne(
        { _id: objectId, isActive: true },
        {
          $push: { members: newMember },
          $set: { updatedAt: new Date() },
        },
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error adding member to workspace:', error);
      return false;
    }
  }

  /**
   * Remove member from workspace
   */
  static async removeMember(workspaceId: string, userId: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(workspaceId);

      const result = await WorkspaceModel.collection.updateOne(
        { _id: objectId, 'members.userId': userId },
        {
          $set: {
            'members.$.isActive': false,
            updatedAt: new Date(),
          },
        },
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error removing member from workspace:', error);
      return false;
    }
  }

  /**
   * Update workspace
   */
  static async update(
    id: string,
    updateData: Partial<Workspace>,
  ): Promise<WorkspaceResponse | null> {
    try {
      const objectId = new ObjectId(id);

      const result = await WorkspaceModel.collection.updateOne(
        { _id: objectId, isActive: true },
        {
          $set: {
            ...updateData,
            updatedAt: new Date(),
          },
        },
      );

      if (result.modifiedCount === 0) {
        return null;
      }

      return await WorkspaceModel.findById(id);
    } catch (error) {
      console.error('Error updating workspace:', error);
      return null;
    }
  }

  /**
   * Update workspace (Admin only - can update inactive workspaces)
   */
  static async updateAdmin(
    id: string,
    updateData: Partial<Workspace>,
  ): Promise<WorkspaceResponse | null> {
    try {
      const objectId = new ObjectId(id);

      const result = await WorkspaceModel.collection.updateOne(
        { _id: objectId },
        {
          $set: {
            ...updateData,
            updatedAt: new Date(),
          },
        },
      );

      if (result.modifiedCount === 0) {
        return null;
      }

      return await WorkspaceModel.findByIdAdmin(id);
    } catch (error) {
      console.error('Error updating workspace (admin):', error);
      return null;
    }
  }

  /**
   * Delete workspace (soft delete)
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(id);

      const result = await WorkspaceModel.collection.updateOne(
        { _id: objectId },
        {
          $set: {
            isActive: false,
            updatedAt: new Date(),
          },
        },
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error deleting workspace:', error);
      return false;
    }
  }

  /**
   * Hard delete workspace (permanent deletion)
   */
  static async hardDelete(id: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(id);

      const result = await WorkspaceModel.collection.deleteOne({
        _id: objectId,
      });

      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error hard deleting workspace:', error);
      return false;
    }
  }

  /**
   * Check if user is member of workspace
   */
  static async isMember(workspaceId: string, userId: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(workspaceId);

      const workspace = await WorkspaceModel.collection.findOne({
        _id: objectId,
        'members.userId': userId,
        'members.isActive': true,
        isActive: true,
      });

      return !!workspace;
    } catch (error) {
      console.error('Error checking workspace membership:', error);
      return false;
    }
  }

  /**
   * Get member role in workspace
   */
  static async getMemberRole(
    workspaceId: string,
    userId: string,
  ): Promise<'owner' | 'admin' | 'member' | null> {
    try {
      const objectId = new ObjectId(workspaceId);

      const workspace = await WorkspaceModel.collection.findOne({
        _id: objectId,
        'members.userId': userId,
        'members.isActive': true,
        isActive: true,
      });

      if (!workspace) {
        return null;
      }

      const member = workspace.members.find((m) => m.userId === userId && m.isActive);
      return member?.role || null;
    } catch (error) {
      console.error('Error getting member role:', error);
      return null;
    }
  }

  /**
   * Convert database document to response format
   */
  private static toResponse(workspace: Workspace): WorkspaceResponse {
    // Migrate workspaces that don't have columns yet
    let columns = workspace.columns || [];
    if (columns.length === 0) {
      columns = WorkspaceModel.createDefaultColumns();
    }

    return {
      _id: workspace._id?.toString() || '',
      name: workspace.name,
      description: workspace.description,
      inviteCode: workspace.inviteCode,
      ownerId: workspace.ownerId,
      members: workspace.members
        .filter((member) => member.isActive)
        .map((member) => ({
          userId: member.userId,
          role: member.role,
          joinedAt: member.joinedAt,
          isActive: member.isActive,
        })) as WorkspaceMemberResponse[],
      columns,
      createdAt: workspace.createdAt || new Date(),
      updatedAt: workspace.updatedAt || new Date(),
      isActive: workspace.isActive !== undefined ? workspace.isActive : true,
    };
  }

  /**
   * Get workspace statistics
   */
  static async getStats(): Promise<{ total: number; active: number }> {
    try {
      const total = await WorkspaceModel.collection.countDocuments({});
      const active = await WorkspaceModel.collection.countDocuments({ isActive: true });

      return { total, active };
    } catch (error) {
      console.error('Error getting workspace stats:', error);
      return { total: 0, active: 0 };
    }
  }

  /**
   * Get all workspaces with pagination (Admin only)
   */
  static async getAllWorkspaces(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    workspaces: WorkspaceResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [workspaces, total] = await Promise.all([
        WorkspaceModel.collection
          .find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        WorkspaceModel.collection.countDocuments({}),
      ]);

      const totalPages = Math.ceil(total / limit);

      // Convert to response format and migrate columns if needed
      const workspaceResponses = workspaces.map((ws) => {
        // Auto-migrate columns if missing
        if (!ws.columns || ws.columns.length === 0) {
          ws.columns = WorkspaceModel.createDefaultColumns();
        }
        return WorkspaceModel.toResponse(ws);
      });

      return {
        workspaces: workspaceResponses,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('Error getting all workspaces:', error);
      return {
        workspaces: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  /**
   * Get detailed workspace statistics (Admin only)
   */
  static async getWorkspaceStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    totalMembers: number;
    averageMembersPerWorkspace: number;
    totalColumns: number;
    averageColumnsPerWorkspace: number;
    createdToday: number;
    createdThisWeek: number;
    createdThisMonth: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      monthAgo.setHours(0, 0, 0, 0);

      const [total, active, createdToday, createdThisWeek, createdThisMonth, allWorkspaces] =
        await Promise.all([
          WorkspaceModel.collection.countDocuments({ isActive: true }),
          WorkspaceModel.collection.countDocuments({ isActive: true }),
          WorkspaceModel.collection.countDocuments({ createdAt: { $gte: today }, isActive: true }),
          WorkspaceModel.collection.countDocuments({
            createdAt: { $gte: weekAgo },
            isActive: true,
          }),
          WorkspaceModel.collection.countDocuments({
            createdAt: { $gte: monthAgo },
            isActive: true,
          }),
          WorkspaceModel.collection
            .find({ isActive: true }, { projection: { members: 1, columns: 1 } })
            .toArray(),
        ]);

      const inactive = total - active;

      let totalMembers = 0;
      let totalColumns = 0;

      allWorkspaces.forEach((ws) => {
        totalMembers += ws.members?.filter((m: any) => m.isActive)?.length || 0;
        totalColumns += ws.columns?.length || 0;
      });

      const averageMembersPerWorkspace =
        total > 0 ? Math.round((totalMembers / total) * 100) / 100 : 0;
      const averageColumnsPerWorkspace =
        total > 0 ? Math.round((totalColumns / total) * 100) / 100 : 0;

      return {
        total,
        active,
        inactive,
        totalMembers,
        averageMembersPerWorkspace,
        totalColumns,
        averageColumnsPerWorkspace,
        createdToday,
        createdThisWeek,
        createdThisMonth,
      };
    } catch (error) {
      console.error('Error getting workspace statistics:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        totalMembers: 0,
        averageMembersPerWorkspace: 0,
        totalColumns: 0,
        averageColumnsPerWorkspace: 0,
        createdToday: 0,
        createdThisWeek: 0,
        createdThisMonth: 0,
      };
    }
  }
}
