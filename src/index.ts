import { DataManager, Logger } from '@/lib'

const db_uri = process.env.MONGO_URI

if (!db_uri) {
    throw new Error('MONGO_URI is not an environment variable declared')
}

;(async () => {
    await DataManager.instance.init(db_uri, 'fumo_api', 'fumos')
    await import('./app')
})()

process.on('SIGINT', () => {
    Logger.warn('Exiting process with SIGNIT signal')
    DataManager.instance.close()
    process.exit(0)
})
