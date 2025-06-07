import { Collection, Db } from 'mongodb';
import NodeCache from 'node-cache';
import connectDatabase from './database';

type Document = {
    _id: string;
    url: string;
    filetype: 'gif' | 'png' | 'jpg' | 'webp';
    fumos: string[];
    createdAt: Date;
};

export default class DataManager {
    private db: Collection<Document>;
    private cache: NodeCache;
    private cacheKeyPrefix: string;

    constructor(_db: Db, collection: string) {
        this.db = _db.collection(collection);
        this.cache = new NodeCache({ stdTTL: 60 * 60 * 24 });
        this.cacheKeyPrefix = 'document:';
    }

    static async init(collection: string) {
        const db = await connectDatabase();
        const manager = new DataManager(db, collection);
        const data = await manager.getAll();

        console.log(
            `Database initialized for collection ${collection} with ${data.length} documents`,
        );
        return manager;
    }

    async getAll(): Promise<Document[]> {
        const cacheKeys = this.cache.keys().filter((key) => key.startsWith(this.cacheKeyPrefix));
        if (cacheKeys) {
            const cacheData = cacheKeys
                .map((key) => this.cache.get<Document>(key))
                .filter((data) => data !== undefined);
            return cacheData;
        }

        const data = await this.db.find().toArray();
        if (data.length === 0) {
            console.log('Collection is empty');
            return [];
        }

        for (const item of data) {
            this.cache.set(this.cacheKeyPrefix + item._id, item);
        }

        console.log(`${data.length} documents cached`);
        return data;
    }
}
