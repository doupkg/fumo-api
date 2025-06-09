import 'dotenv/config'
import express from 'express'
import apiRouter from './api'
import interactionsRouter from './bot'
import { DataManager } from './lib'

const port = process.env.PORT || 3000
const development = process.env.DEVELOPMENT || false

if (!process.env.MONGO_URI) {
  throw new Error('Missing environment variable MONGODB_URI')
}

DataManager.instance.init(process.env.MONGO_URI, 'fumo_api', 'fumos')

express()
  .use('/interactions', interactionsRouter)
  .use(express.json())
  .use('/', apiRouter)
  .listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })

if (development) {
  Bun.spawn(['bun', 'run', 'upload'], { cwd: "../" })
}

process.on('SIGINT', () => {
  console.log('shutting down hehehehehe\n')
  DataManager.instance.close()
  process.exit(0)
})
