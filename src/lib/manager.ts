import { Collection, Db, Filter, ObjectId } from 'mongodb';
import NodeCache from 'node-cache';
import connectDatabase from './database';
import fumos from '../data/fumos.json';
import sift from 'sift';

const filetypes = ['gif', 'png', 'jpg', 'webp'];

type InsertionData = {
    url: string;
    filetype: 'gif' | 'png' | 'jpg' | 'webp';
    fumos: string[];
};

type Document = InsertionData & {
    _id: ObjectId;
};

export default class DataManager {
    private db: Collection<InsertionData>;
    private cache: NodeCache;
    private cacheKeyPrefix: string;

    constructor(_db: Db, collection: string) {
        this.db = _db.collection(collection);
        this.cache = new NodeCache({ stdTTL: 60 * 60 * 24 });
        this.cacheKeyPrefix = `${collection}:document:`;
    }

    private makePrefix(id: ObjectId | string) {
        return `${this.cacheKeyPrefix}${id.toString()}`;
    }

    static async init(uri: string, db: string, collection: string) {
        const database = await connectDatabase(uri, db);
        const manager = new DataManager(database, collection);
        const data = await manager.getAll();

        console.log(
            `Database initialized for collection ${collection} with ${data.length} documents`,
        );
        return manager;
    }

    async create(data: InsertionData): Promise<Document> {
        if (!data.url || !filetypes.includes(data.filetype) || !Array.isArray(data.fumos)) {
            throw new Error('Invalid parameters');
        }

        const existing = await this.find({ url: data.url });
        if (existing.length > 0) {
            throw new Error(`Document already exists`);
        }

        const result = await this.db.insertOne(data);

        if (!result.acknowledged) {
            throw new Error('Error al insertar el documento en la base de datos');
        }

        const insertedDocument: Document = {
            _id: result.insertedId,
            ...data,
        };

        this.cache.set(this.makePrefix(result.insertedId), insertedDocument);

        return insertedDocument;
    }

    async find(query: Filter<Document>): Promise<Document[]> {
        const cachedItems = this.searchCache(query);
        if (cachedItems.length > 0) {
            return cachedItems;
        }

        const data = await this.db.find(query).toArray();
        for (const item of data) {
            this.cache.set(this.makePrefix(item._id), item);
        }
        return data;
    }

    private searchCache(query: Filter<Document>): Document[] {
        const allCacheKeys = this.cache.keys();
        const documents: Document[] = [];

        const siftQuery = this.prepareSiftQuery(query);
        const test = sift(siftQuery);

        for (const key of allCacheKeys) {
            const doc = this.cache.get<Document>(key);
            if (doc && test({ ...doc, _id: doc._id.toString() })) {
                documents.push(doc);
            }
        }

        return documents;
    }

    private prepareSiftQuery(query: Filter<Document>) {
        const prepared = { ...query } as any;

        if ('_id' in prepared) {
            const idQuery = prepared._id;
            if (idQuery instanceof ObjectId) {
                prepared._id = idQuery.toString();
            } else if (typeof idQuery === 'object' && idQuery !== null) {
                if ('$eq' in idQuery) {
                    idQuery.$eq = (idQuery.$eq as ObjectId).toString();
                }
                if ('$in' in idQuery) {
                    idQuery.$in = (idQuery.$in as ObjectId[]).map((id) => id.toString());
                }
            }
        }

        return prepared;
    }

    async getById(id: string): Promise<Document | null> {
        if (!ObjectId.isValid(id)) return null;

        const cacheKey = this.makePrefix(id);
        const cachedData = this.cache.get<Document>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        const data = await this.db.findOne({ _id: new ObjectId(id) });
        if (!data) return null;

        this.cache.set(cacheKey, data);
        return data;
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
