// @ts-ignore: types resolved in container runtime
import { Collection, ObjectId, type ObjectId as ObjectIdType } from 'mongodb'
import Database from '../config/database.js'

export type TaskStatus = 'plannifié' | 'en cours' | 'terminé'

export interface Task {
  _id?: any
  title: string
  description?: string
  dueDate?: string
  status: TaskStatus
  workspaceId?: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
}

export class TaskModel {
  private static collection: any

  static initialize() {
    const db = Database.getInstance()
    this.collection = db.getCollection('tasks')
  }

  static async findByWorkspace(workspaceId: string): Promise<Task[]> {
    return this.collection.find({ workspaceId }).toArray()
  }

  static async findByAssignedTo(userId: string): Promise<Task[]> {
    return this.collection.find({ assignedTo: userId }).toArray()
  }

  static async updateStatus(id: string, status: TaskStatus): Promise<Task | null> {
    if (!ObjectId.isValid(id)) return null
    const _id = new ObjectId(id)
    await this.collection.updateOne({ _id }, { $set: { status, updatedAt: new Date() } })
    return this.collection.findOne({ _id })
  }
}
