import { ObjectId } from 'mongodb';

export interface Task {
    _id?: ObjectId;
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    status: string; // Status name (columnName)
    columnId?: string; // The column ID in workspace
    columnName: string; // The column display name
    workspaceId?: string;
    assignedMembers: string[]; // Array of User IDs
    createdBy: string; // User ID
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    completedAt?: Date;
}


export interface TaskResponse {
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    status: string;
    columnId?: string;
    columnName: string;
    workspaceId?: string;
    assignedMembers: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    completedAt?: Date;
}

