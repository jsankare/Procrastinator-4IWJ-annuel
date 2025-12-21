// @ts-ignore: types resolved in container runtime
import { Collection, ObjectId } from 'mongodb'
import Database from '../config/database.js'

export type WorkspaceVisibility = 'private' | 'public'

export interface Workspace {
  _id?: any
  name: string
  description?: string
  visibility: WorkspaceVisibility
  inviteCode: string
  members: string[] // array of userId strings
  createdAt: Date
  updatedAt: Date
}

export class WorkspaceModel {
  private static collection: any

  static initialize() {
    const db = Database.getInstance()
    this.collection = db.getCollection('workspaces')
  }

  static async findByMember(userId: string): Promise<Workspace[]> {
    return this.collection.find({ members: userId }).toArray()
  }

  static async findById(id: string): Promise<Workspace | null> {
    if (!ObjectId.isValid(id)) return null
    return this.collection.findOne({ _id: new ObjectId(id) })
  }

  static async findByInvite(inviteCode: string): Promise<Workspace | null> {
    return this.collection.findOne({ inviteCode })
  }

  static async create(userId: string, data: { name: string; description?: string; visibility: WorkspaceVisibility; inviteCode: string }): Promise<Workspace> {
    const workspace: Workspace = {
      name: data.name,
      description: data.description,
      visibility: data.visibility,
      inviteCode: data.inviteCode,
      members: [userId],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const res = await this.collection.insertOne(workspace)
    const created = await this.collection.findOne({ _id: res.insertedId })
    if (!created) throw new Error('Workspace creation failed')
    return created
  }

  static async addMember(workspaceId: any, userId: string): Promise<Workspace | null> {
    await this.collection.updateOne({ _id: workspaceId }, { $addToSet: { members: userId }, $set: { updatedAt: new Date() } })
    return this.collection.findOne({ _id: workspaceId })
  }

  static async removeMember(workspaceId: any, userId: string): Promise<Workspace | null> {
    await this.collection.updateOne({ _id: workspaceId }, { $pull: { members: userId }, $set: { updatedAt: new Date() } })
    return this.collection.findOne({ _id: workspaceId })
  }
}
