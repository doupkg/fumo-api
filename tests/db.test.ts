import { MongoMemoryServer } from 'mongodb-memory-server';
import DataManager from '../src/lib/manager';
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import fumos from '../src/data/fumos.json';

let mongoServer: MongoMemoryServer;
let manager: DataManager;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    manager = await DataManager.init(uri, 'testdb', 'fumos');
});

describe('database', () => {
    it('should return empty array of documents', async () => {
        const document = await manager.getAll();
        expect(document).toBeArrayOfSize(0);
    });

    it('should return null if document does not exist', async () => {
        const document = await manager.getById('1');
        expect(document).toBeNull();
    });

    it('should create a document and update cache', async () => {
        await manager.create({
            url: 'https://example.com',
            filetype: 'png',
            fumos: fumos.slice(0, 5).map((fumo) => fumo.value),
        });

        await manager.create({
            url: 'https://example2.com',
            filetype: 'jpg',
            fumos: fumos.slice(5, 10).map((fumo) => fumo.value),
        });

        const byFumo = await manager.find({ fumos: { $in: ['yuyuko'] } });
        expect(byFumo).toBeArrayOfSize(1);
    });
});

afterAll(async () => {
    await mongoServer.stop();
});
