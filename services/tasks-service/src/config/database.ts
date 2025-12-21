// @ts-ignore: types resolved in container runtime
import { MongoClient, Db, Collection, Document } from 'mongodb'

const MONGODB_URI =
  // @ts-ignore: process types available at runtime
  process.env.MONGODB_URI ||
  'mongodb://procrastinator_user:procrastinator_pass@mongodb:27017/procrastinator?authSource=procrastinator'
// @ts-ignore: process types available at runtime
const DB_NAME = process.env.DB_NAME || 'procrastinator'

class Database {
  private static instance: Database
  private client: any | null = null
  private db: any | null = null

  private constructor() {}

  public static getInstance(): Database {
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

  public getCollection<T = any>(name: string): any {
    return this.getDb().collection(name)
  }
}

export default Database
