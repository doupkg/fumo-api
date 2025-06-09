import { type Request, type Response, Router } from 'express'
import { DataManager, type Document } from '../lib/'
import Fumos from '../data/fumos.json'

type Query = Record<string, any>

const apiRouter = Router()

apiRouter.get('/', (_req: Request, res: Response) => {
  res.send(`codeberg is ahh, last deploy: ${Date.now().toString()}`)
})

apiRouter.get('/fumos', async (req: Request, res: Response) => {
  try {
    const { has, filetype } = req.query
    const query: Query = {}

    if (has) {
      query.has = { $all: Array.isArray(has) ? has : [has] }
    }

    if (filetype) {
      if (!DataManager.instance.validateFiletype(String(filetype))) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Must be one of: gif, png, jpg, webp',
        })
      }
      query.filetype = filetype
    }

    let documents: Document[]
    let filtered = false

    if (query.length > 0) {
      documents = await DataManager.instance.find(query)
      filtered = true
    } else {
      documents = await DataManager.instance.getAll()
    }

    res.status(200).json({
      filtered,
      data: documents.map((doc) => ({
        id: doc._id.toString(),
        url: doc.url,
        filetype: doc.filetype,
        fumos: doc.fumos,
      })),
    })
  } catch (error) {
    console.error('Error in /fumos:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

apiRouter.get('/random', async (req: Request, res: Response) => {
  try {
    const { filetype } = req.query
    const query: Query = {}

    if (filetype) {
      if (!DataManager.instance.validateFiletype(String(filetype))) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Must be one of: gif, png, jpg, webp',
        })
      }
      query.filetype = filetype
    }

    let documents: Document[]
    let filtered = false

    if (query.length > 0) {
      documents = await DataManager.instance.find(query)
      filtered = true
    } else {
      documents = await DataManager.instance.getAll()
    }

    const selected = documents[Math.floor(Math.random() * documents.length)]

    res.status(200).json({
      filtered,
      data: selected ?? null,
    })
  } catch (error) {
    console.error('Error in /random:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      messsage: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

apiRouter.get('/get', async (req: Request, res: Response) => {
  try {
    const { id } = req.query

    if (!id)
      return res.status(400).json({
        error: 'Bad Request',
        message: "You cannot get a fumo without it's id, try /fumos instead",
      })

    const selected = await DataManager.instance.getById(String(id))

    return selected
      ? res.json({
        filtered: true,
        data: selected,
      })
      : res.status(444).json({
        error: 'No Response',
        message: "Id is invalid or doesn't exist",
      })
  } catch (error) {
    console.error('Error in /get:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

apiRouter.get('/characters', (_req: Request, res: Response) => {
  try {
    return res.status(200).json({
      filtered: false,
      data: Fumos,
    })
  } catch (error) {
    console.error('Error in /characters:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

export default apiRouter
