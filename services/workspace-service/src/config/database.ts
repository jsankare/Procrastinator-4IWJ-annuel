// @ts-ignore
import { MongoClient } from 'mongodb'

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://procrastinator_user:procrastinator_pass@mongodb:27017/procrastinator?authSource=procrastinator'
const DB_NAME = process.env.DB_NAME || 'procrastinator'

class Database {
  private static instance: any
  private client: any = null
  private db: any = null

  private constructor() {}

  public static getInstance(): any {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  public async connect(): Promise<void> {
    this.client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    })
    await this.client.connect()
    this.db = this.client.db(DB_NAME)
    await this.db.admin().ping()
  }

  public getDb(): any {
    if (!this.db) throw new Error('Database not connected')
    return this.db
  }

  public getCollection(name: string): any {
    return this.getDb().collection(name)
  }
}

export default Database
