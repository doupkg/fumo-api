import { Elysia, status, t } from 'elysia'
import { DataManager, Logger, type Document } from '../lib/'
import { Filter } from 'mongodb'
import Characters from '../data/characters.json'

const responseExample = {
    id: '5f92cdce0cf217478ba93563',
    url: 'https://imgur.com/bounce.gif',
    filetype: 'gif',
    title: 'Marisa Bouncing',
    characters: ['marisa'],
}

const Rest = new Elysia().model({
    filtered: t.Boolean(),
    data: t.Object({
        id: t.String(),
        url: t.String(),
        filetype: t.String(),
        title: t.String(),
        characters: t.Array(t.String()),
    }),
})

const unixtime = new Date()

Rest.get('/', `codeberg is ahh, last deploy: ${unixtime.toUTCString()}`)

Rest.get(
    '/fumos',
    async ({ query }) => {
        try {
            const final_query = {} as Filter<Document>
            if (query.has) {
                final_query.has = { $all: Array.isArray(query.has) ? query.has : [query.has] }
            }

            if (query.filetype) {
                final_query.filetype = query.filetype
            }

            let documents: Document[]
            let filtered = false

            if (final_query.hasOwnProperty('has') || final_query.hasOwnProperty('filetype')) {
                documents = await DataManager.instance.find(final_query)
                filtered = true
            } else {
                documents = await DataManager.instance.getAll()
            }

            status(200, {
                filtered,
                data: documents.map((doc) => ({
                    id: doc._id.toString(),
                    url: doc.url,
                    filetype: doc.filetype,
                    title: doc.title,
                    characters: doc.characters,
                })),
            })
        } catch (error) {
            Logger.error('Error in /fumos:', error)
            status(500, {
                error: 'Internal Server Error',
                message: error instanceof Error ? error.message : 'Unknown error',
            })
        }
    },
    {
        query: t.Partial(
            t.Object({
                has: t.Array(
                    t.String({
                        description: 'The name of the fumo (value)',
                        example: 'cirno',
                        readOnly: true,
                    }),
                    {
                        description:
                            "Array of fumo's name. To see the all possibly correct values, watch the list in /characters endpoint, «value»'s property.",
                        examples: ['/fumos?has=cirnu,marisa,reimu'],
                        readOnly: true,
                    },
                ),
                filetype: t.String({
                    description: 'The filetype that is wanted, it drops what it finds.',
                    examples: ['/fumos?filetype=gif'],
                    pattern: '^(gif|png|jpg|webp)$',
                    readOnly: true,
                }),
            }),
        ),
        // @ts-ignore
        response: {
            200: {
                description: 'Success',
                example: {
                    filtered: true,
                    data: [responseExample, responseExample],
                },
            },
        },
        detail: {
            description: 'Obtain all fumos of our database, or filter them with the query options below.',
        },
    },
)

Rest.get(
    '/random',
    async ({ query }) => {
        try {
            const final_query = {} as Filter<Document>
            if (query.has) {
                final_query.has = { $all: Array.isArray(query.has) ? query.has : [query.has] }
            }

            if (query.filetype) {
                final_query.filetype = query.filetype
            }

            let documents: Document[]
            let filtered = false

            if (final_query.hasOwnProperty('has') || final_query.hasOwnProperty('filetype')) {
                documents = await DataManager.instance.find(final_query)
                filtered = true
            } else {
                documents = await DataManager.instance.getAll()
            }

            const selected = documents[Math.floor(Math.random() * documents.length)]

            selected
                ? status(200, {
                      filtered,
                      data: selected,
                  })
                : status(444, {
                      error: 'Not Found',
                      message: 'Rest API was not able to get a random fumo, that is weird',
                  })
        } catch (error) {
            Logger.error(`Error in /random: ${error}`)
            status(500, {
                error: 'Internal Server Error',
                message: error instanceof Error ? error.message : 'Unknown error',
            })
        }
    },
    {
        query: t.Partial(
            t.Object({
                has: t.Array(
                    t.String({
                        description: 'The name of the fumo (value)',
                        example: 'cirno',
                        readOnly: true,
                    }),
                    {
                        description:
                            "Array of fumo's name. To see the all possibly correct values, watch the list in /characters endpoint, «value»'s property.",
                        examples: ['/fumos?has=cirnu,marisa,reimu'],
                        readOnly: true,
                    },
                ),
                filetype: t.String({
                    description: 'The filetype that is wanted, it drops what it finds.',
                    examples: ['/fumos?filetype=gif'],
                    pattern: '^(gif|png|jpg|webp)$',
                    readOnly: true,
                }),
            }),
        ),
        // @ts-ignore
        response: {
            200: {
                description: 'Success',
                example: {
                    filtered: false,
                    data: responseExample,
                },
            },
            444: {
                description: 'Fumo was not found',
                example: {
                    error: 'Not Found',
                    message: 'Rest API was not able to get a random fumo, that is weird',
                },
            },
        },
        detail: {
            description:
                'Obtain a random fumo from our database, note that data is, in this time, a single Object and not an Array. Parameters are the same as /fumos endpoint.',
        },
    },
)

Rest.get(
    '/characters',
    ({}) => {
        try {
            return {
                filtered: false,
                data: Characters,
            }
        } catch (error) {
            Logger.error(`Error in /characters: ${error}`)
            status(500, {
                error: 'Internal Server Error',
                message: error instanceof Error ? error.message : 'Unknown error',
            })
        }
    },
    {
        // @ts-ignore
        response: {
            200: {
                description: 'Success',
                example: { filtered: false, data: Characters },
            },
        },
        detail: {
            description: 'Get all characters available on our characters.json',
        },
    },
)

Rest.get(
    '/id/:id',
    async ({ params }) => {
        try {
            const { id } = params

            const selected = await DataManager.instance.getById(id)

            return selected
                ? {
                      filtered: true,
                      data: selected,
                  }
                : status(444, {
                      error: 'No Response',
                      message: 'Id is invalid or does not exist',
                  })
        } catch (error) {
            Logger.error(`Error in /id/${params.id}: ${error}`)
            status(500, {
                error: 'Internal Server Error',
                message: error instanceof Error ? error.message : 'Unknown error',
            })
        }
    },
    {
        params: t.Object({
            id: t.String({
                description: "Fumo's Id you want to get, watch them all on /fumos",
                readOnly: true,
            }),
        }),
        // @ts-ignore
        response: {
            200: {
                description: 'Success',
                example: responseExample,
            },
            444: {
                description: 'Fumo was not found',
                example: {
                    error: 'No Response',
                    message: 'Id is invalid or does no exist',
                },
            },
        },
        detail: {
            description: "Get a Fumo putting it's id on /id/:id :)",
        },
    },
)

Logger.info('Rest API endpoints loaded')

export default Rest
