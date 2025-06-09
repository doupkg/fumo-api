import { Collection, Db, Filter, ObjectId } from 'mongodb';
import NodeCache from 'node-cache';
import DatabaseConnection from './database';
import fumos from '../data/fumos.json';
import sift from 'sift';

const filetypes = ['gif', 'png', 'jpg', 'webp'];

export type InsertionData = {
    url: string;
    title: string;
    filetype: 'gif' | 'png' | 'jpg' | 'webp';
    fumos: string[];
};

export type Document = InsertionData & {
    _id: ObjectId;
};

export class DataManager {
    private static _instance: DataManager | null = null;
    private db: Collection<Document> | null = null;
    private cache: NodeCache;
    private cacheKeyPrefix: string = '';

    private constructor() {
        this.cache = new NodeCache({ stdTTL: 60 * 60 * 24 });
    }

    static get instance(): DataManager {
        if (!DataManager._instance) {
            DataManager._instance = new DataManager();
        }
        return DataManager._instance;
    }

    private checkInitialized() {
        if (!this.db) throw new Error('Database not initialized');
    }

    private makePrefix(id: ObjectId | string) {
        return `${this.cacheKeyPrefix}${id.toString()}`;
    }

    validateFiletype(filetype: string) {
        return filetypes.includes(filetype);
    }

    validateFumos(names: string[]) {
        return names.every((name) => fumos.some((fumo) => fumo.value === name));
    }

    async init(uri: string, db: string, collection: string): Promise<void> {
        if (this.db) {
            console.log('Database already initialized');
            return;
        }

        const database = DatabaseConnection.instance.connect(uri, db);
        this.db = database.collection(collection);
        this.cacheKeyPrefix = `${collection}:document:`;

        const data = await this.getAll();
        console.log(
            `Database initialized for collection ${collection} with ${data.length} documents`,
        );
    }

    async upload(data: InsertionData): Promise<Document> {
        this.checkInitialized();

        if (
            !data.url ||
            !data.title ||
            !this.validateFiletype(data.filetype) ||
            !this.validateFumos(data.fumos)
        ) {
            throw new Error('Invalid parameters');
        }

        const existing = await this.find({ url: data.url });
        if (existing.length > 0) {
            throw new Error(`File already exists`, { cause: existing[0] });
        }

        const result = await this.db!.insertOne({
            ...data,
            _id: new ObjectId(),
        });

        if (!result.acknowledged) {
            throw new Error('Database error');
        }

        const insertedDocument: Document = {
            _id: result.insertedId,
            ...data,
        };

        this.cache.set(this.makePrefix(result.insertedId), insertedDocument);

        return insertedDocument;
    }

    async find(query: Filter<Document>): Promise<Document[]> {
        this.checkInitialized();

        const cachedItems = this.searchCache(query);
        if (cachedItems.length > 0) {
            return cachedItems;
        }

        const data = await this.db!.find(query).toArray();
        for (const item of data) {
            this.cache.set(this.makePrefix(item._id), item);
        }
        return data;
    }

    private searchCache(query: Filter<Document>): Document[] {
        const allCacheKeys = this.cache.keys();
        const documents: Document[] = [];

        const test = sift(this.prepareQueryForCache(query));

        for (const key of allCacheKeys) {
            const doc = this.cache.get<Document>(key);
            if (doc && test({ ...doc, _id: doc._id.toString() })) {
                documents.push(doc);
            }
        }

        return documents;
    }

    private prepareQueryForCache(query: Filter<Document>) {
        const prepared = { ...query } as any;

        if ('_id' in prepared) {
            const idQuery = prepared._id;
            if (idQuery instanceof ObjectId) {
                prepared._id = idQuery.toString();
            }
        }

        return prepared;
    }

    async getById(id: string): Promise<Document | null> {
        this.checkInitialized();
        if (!ObjectId.isValid(id)) return null;

        const cacheKey = this.makePrefix(id);
        const cachedData = this.cache.get<Document>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        const data = await this.db!.findOne({ _id: new ObjectId(id) });
        if (!data) return null;

        this.cache.set(cacheKey, data);
        return data;
    }

    async getAll(): Promise<Document[]> {
        this.checkInitialized();

        const cacheKeys = this.cache.keys().filter((key) => key.startsWith(this.cacheKeyPrefix));
        if (cacheKeys) {
            const cacheData = cacheKeys
                .map((key) => this.cache.get<Document>(key))
                .filter((data) => data !== undefined);
            return cacheData;
        }

        const data = await this.db!.find().toArray();
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

    close() {
        this.cache.flushAll();
        DatabaseConnection.instance.disconnect();
    }
}
