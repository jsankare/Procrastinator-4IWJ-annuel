import { MongoClient, Db, Collection, Document } from 'mongodb';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://procrastinator_user:procrastinator_pass@mongodb:27017/procrastinator?authSource=procrastinator';
const DB_NAME = process.env.DB_NAME || 'procrastinator';

class Database {
  private static instance: Database;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      console.log('Connecting to MongoDB...');

      this.client = new MongoClient(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
      });

      await this.client.connect();
      this.db = this.client.db(DB_NAME);

      // Test
      await this.db.admin().ping();

      console.log('Successfully connected to MongoDB');
      console.log(`Database: ${DB_NAME}`);
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
        console.log('Disconnected from MongoDB');
      }
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  public getCollection<T extends Document = Document>(name: string): Collection<T> {
    return this.getDb().collection<T>(name);
  }

  public async healthCheck(): Promise<{ status: string; database: string; timestamp: string }> {
    try {
      if (!this.db) {
        throw new Error('Database not connected');
      }

      // Ping
      await this.db.admin().ping();

      return {
        status: 'healthy',
        database: DB_NAME,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: DB_NAME,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export default Database;
