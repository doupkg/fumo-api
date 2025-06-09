import { type Db, MongoClient } from 'mongodb'

export default class DatabaseConnection {
  private static _instance: DatabaseConnection
  private client: MongoClient | null = null
  private db: Db | null = null

  private constructor() { }

  static get instance(): DatabaseConnection {
    if (!DatabaseConnection._instance) {
      DatabaseConnection._instance = new DatabaseConnection()
    }
    return DatabaseConnection._instance
  }

  connect(uri: string, dbName: string): Db {
    if (this.db) {
      return this.db
    }

    this.client = new MongoClient(uri)
    this.client.connect().catch(console.error)
    this.db = this.client.db(dbName)

    return this.db
  }

  disconnect() {
    if (this.client) {
      this.client.close().catch(console.error)
      this.client = null
      this.db = null
    }
  }
}
