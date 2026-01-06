export interface Task {
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


export interface CreateTaskInput {
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    columnId?: string;
    columnName: string;
    workspaceId?: string;
    assignedMembers?: string[];
}

export interface UpdateTaskInput {
    title?: string;
    description?: string;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high';
    columnId?: string;
    columnName?: string;
    assignedMembers?: string[];
}


export interface TaskStats {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    overdue: number;
}
