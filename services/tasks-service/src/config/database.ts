import { MongoClient, Db } from 'mongodb';

export default class Database {
    private static instance: Database;
    private client: MongoClient | null = null;
    private db: Db | null = null;
    private uri: string;
    private dbName: string;

    private constructor() {
        this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        this.dbName = process.env.DB_NAME || 'procrastinator';
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async connect(): Promise<void> {
        if (this.client && this.db) {
            console.log('[Database] Already connected');
            return;
        }

        try {
            this.client = new MongoClient(this.uri);
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            console.log(`[Database] ✅ Connected to MongoDB: ${this.dbName}`);
        } catch (error) {
            console.error('[Database] ❌ Connection failed:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
            console.log('[Database] Disconnected from MongoDB');
        }
    }

    public getDb(): Db {
        if (!this.db) {
            throw new Error('Database not initialized. Call connect() first.');
        }
        return this.db;
    }

    public async healthCheck(): Promise<{ status: string; database: string }> {
        if (!this.db) {
            throw new Error('Database not connected');
        }

        try {
            await this.db.admin().ping();
            return {
                status: 'connected',
                database: this.dbName,
            };
        } catch (error) {
            return {
                status: 'disconnected',
                database: this.dbName,
            };
        }
    }
}
