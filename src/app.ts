import { Elysia } from 'elysia'
import { Logger } from './lib'
import swagger from '@elysiajs/swagger'
import Rest from './api'
import Interactions from './bot'
import Package from 'package.json'

const port = process.env.PORT || 3000

const App = new Elysia()
    .use(Rest)
    .use(Interactions)
    .use(
        swagger({
            documentation: {
                info: {
                    title: Package.name,
                    license: Package.license,
                    version: Package.version,
                    description: Package.description,
                },
            },
            path: '/docs',
            exclude: ['/', '/interactions/'],
        }),
    )
    .listen(port, () => Logger.assert('App is listening at ' + port))

export default App
