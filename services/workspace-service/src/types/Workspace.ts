import type { ObjectId } from 'mongodb';

export interface Workspace {
  _id?: string | ObjectId;
  name: string;
  description?: string | undefined;
  inviteCode: string;
  ownerId: string;
  members: WorkspaceMember[];
  columns: WorkspaceColumn[];
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export interface WorkspaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  isActive: boolean;
}

export interface WorkspaceColumn {
  _id?: string | ObjectId;
  name: string;
  color?: string;
  position: number;
  createdAt: Date;
  isActive: boolean;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
}

export interface JoinWorkspaceRequest {
  inviteCode: string;
}

export interface WorkspaceResponse {
  _id: string;
  name: string;
  description?: string | undefined;
  inviteCode: string;
  ownerId: string;
  members: WorkspaceMemberResponse[];
  columns: WorkspaceColumn[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface WorkspaceMemberResponse {
  userId: string;
  username?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  email?: string | undefined;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  isActive: boolean;
}

export interface WorkspaceListResponse {
  workspaces: WorkspaceResponse[];
  total: number;
}

export interface JoinWorkspaceResponse {
  workspace: WorkspaceResponse;
  member: WorkspaceMemberResponse;
}
