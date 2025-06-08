import { MongoClient } from 'mongodb';

export default async function connectDatabase(uri: string, db: string) {
    const client = new MongoClient(uri);
    await client.connect();

    const database = client.db(db);
    return database;
}
