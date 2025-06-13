import { Elysia } from 'elysia'
import { DataManager, Logger } from '@/lib'
import Rest from './api'
import Interactions from './bot'
import Package from '../package.json'
import swagger from '@elysiajs/swagger'

const db_uri = process.env.MONGO_URI
const port = process.env.PORT || 3000

if (!db_uri) {
    throw new Error('MONGO_URI is not an environment variable declared')
}

;(async () => {
    await DataManager.instance.init(db_uri, 'fumo_api', 'fumos')

    new Elysia()
        .use(Rest)
        .use(Interactions)
        .use(
            swagger({
                documentation: {
                    info: {
                        title: 'Most Cool Fumo Rest API On HTTP',
                        license: Package.license,
                        version: Package.version,
                    },
                },
                path: '/docs',
                exclude: ['/', '/interactions/'],
            }),
        )
        .listen(port, () => Logger.assert('App is listening at ' + port))
})()

process.on('SIGINT', () => {
    Logger.warn('Exiting process with SIGNIT signal')
    DataManager.instance.close()
    process.exit(0)
})
