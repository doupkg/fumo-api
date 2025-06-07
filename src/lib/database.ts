import { MongoClient } from 'mongodb';

export default async function connectDatabase() {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is required.');
    }

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    const db = client.db(process.env.MONGO_DB);
    return db;
}
