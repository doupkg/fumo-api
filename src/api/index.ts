import { Elysia, status } from 'elysia'
import { DataManager, Logger, validateQuery, type Document } from '@/lib/'
import Characters from '@/data/characters.json'
import { IdParamsType, QueryType, ResponseType } from './types'

const unixtime = new Date()

const Rest = new Elysia()
    .model('Response', ResponseType)
    .get('/', `codeberg is ahh, last deploy: ${unixtime.toUTCString()}`)
    .get(
        '/fumos',
        async ({ query }) => {
            const final_query = validateQuery(query)

            let documents: Document[]
            let filtered = false

            if (final_query.hasOwnProperty('has') || final_query.hasOwnProperty('filetype')) {
                documents = await DataManager.instance.find(final_query)
                filtered = true
            } else {
                documents = await DataManager.instance.getAll()
            }

            return status(200, {
                filtered,
                data: documents.map((doc) => ({
                    id: doc._id.toString(),
                    url: doc.url,
                    filetype: doc.filetype,
                    title: doc.title,
                    characters: doc.characters,
                })),
            })
        },
        {
            query: QueryType,
            detail: {
                description: 'Obtain all fumos of our database, or filter them with the query options below.',
            },
        },
    )

    .get(
        '/random',
        async ({ query }) => {
            const final_query = validateQuery(query)

            let documents: Document[]
            let filtered = false

            if (final_query.has || final_query.filetype) {
                documents = await DataManager.instance.find(final_query)
                filtered = true
            } else {
                documents = await DataManager.instance.getAll()
            }

            const selected = documents[Math.floor(Math.random() * documents.length)]

            return selected
                ? status(200, {
                      filtered,
                      data: selected,
                  })
                : status(444, {
                      error: 'Not Found',
                      message: "Rest API couldn't choose a fumo, that's weird",
                  })
        },
        {
            query: QueryType,
            detail: {
                description:
                    'Obtain a random fumo from our database, note that data is, in this time, a single Object and not an Array.',
            },
        },
    )

    .get(
        '/characters',
        () => {
            return status(200, { filtered: false, data: Characters })
        },
        {
            detail: {
                description: 'Get all characters available on our characters.json',
            },
        },
    )

    .get(
        '/id/:id',
        async ({ params }) => {
            const { id } = params

            const selected = await DataManager.instance.getById(id)

            return selected
                ? status(200, {
                      filtered: true,
                      data: selected,
                  })
                : status(444, {
                      error: 'No Response',
                      message: 'Id is invalid or does not exist',
                  })
        },
        {
            params: IdParamsType,
            detail: {
                description: "Get a Fumo putting it's id on /id/:id :)",
            },
        },
    )

Logger.info('Rest API endpoints loaded')

export default Rest
