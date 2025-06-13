import { t } from 'elysia'

export const ResponseType = t.Object({
    filtered: t.Boolean(),
    data: t.Unknown(),
})

export const QueryType = t.Partial(
    t.Object({
        has: t.Array(t.String(), {
            description:
                "Array of fumo's name. To see the all possibly correct values, watch the list in /characters endpoint, «value»'s property.",
            examples: ['/fumos?has=cirnu,marisa,reimu'],
            readOnly: true,
        }),
        filetype: t.String({
            description: 'The filetype that is wanted, it drops what it finds.',
            examples: ['/fumos?filetype=gif'],
            pattern: '^(gif|png|jpg|webp)$',
            readOnly: true,
        }),
    }),
)

export const IdParamsType = t.Object({
    id: t.String({
        description: "Fumo's Id you want to get, watch them all on /fumos",
        readOnly: true,
    }),
})
