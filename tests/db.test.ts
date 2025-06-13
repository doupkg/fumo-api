import { MongoMemoryServer } from 'mongodb-memory-server'
import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import { DataManager } from '@/lib/'
import Characters from '@/data/characters.json'

let mongoServer: MongoMemoryServer

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await DataManager.instance.init(uri, 'testdb', 'fumos')
})

describe('database', () => {
    it('should return empty array of documents', async () => {
        const document = await DataManager.instance.getAll()
        expect(document).toBeArrayOfSize(0)
    })

    it('should return null if document does not exist', async () => {
        const document = await DataManager.instance.getById('1')
        expect(document).toBeNull()
    })

    it('should throw error if document already exists', async () => {
        await DataManager.instance.upload({
            url: 'https://example.com',
            title: 'test',
            filetype: 'png',
            characters: Characters.slice(0, 5).map((character) => character.value),
        })

        expect(
            DataManager.instance.upload({
                url: 'https://example.com',
                title: 'test2',
                filetype: 'jpg',
                characters: Characters.slice(5, 10).map((character) => character.value),
            }),
        ).rejects.toThrow('File already exists')
    })
})

afterAll(async () => {
    await mongoServer.stop()
})
