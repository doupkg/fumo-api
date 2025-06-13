import { APIInteraction, InteractionType, InteractionResponseType, MessageFlags } from 'discord-api-types/v10'
import { Elysia, status, t } from 'elysia'
import Commands from './commands'
import Components from './components/'
import Modals from './modals'
import { responseToSetHeaders } from 'elysia/adapter/utils'
import { Logger, verifyKey } from '@/lib'

const { DISCORD_PUBLIC_KEY } = process.env

if (!DISCORD_PUBLIC_KEY) {
    throw new Error('DISCORD_PUBLIC_KEY environment variable is missing')
}

const commandCollection = new Map<string, any>(Commands.map((command) => [command.name, command]))
const componentCollection = new Map<string, any>(Components.map((component) => [component.name, component]))
const modalCollection = new Map<string, any>(Modals.map((modal) => [modal.name, modal]))

const Interactions = new Elysia({ prefix: '/interactions' })

Interactions.post(
    '/',
    async ({ body }) => {
        const interaction = body as APIInteraction

        try {
            switch (interaction.type) {
                case InteractionType.Ping:
                    Logger.info('Ping received')
                    return { type: InteractionResponseType.Pong }

                case InteractionType.ApplicationCommand:
                    const command = commandCollection.get(interaction.data.name)
                    const cmd_data = await command?.execute(interaction)
                    Logger.info(cmd_data)

                    return cmd_data

                case InteractionType.MessageComponent:
                    const component = componentCollection.get(interaction.data.custom_id.split(':')[0])
                    const component_data = await component?.execute(interaction)

                    return component_data

                case InteractionType.ModalSubmit:
                    const modal = modalCollection.get(interaction.data.custom_id)
                    const modal_data = await modal?.execute(interaction)

                    return modal_data
            }
        } catch (error) {
            Logger.error(error)
            return {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: { content: 'An error occurred', flags: MessageFlags.Ephemeral },
            }
        }
    },
    {
        body: t.Unknown(),
        /**
         * Code taken from discord-interactions source code
         **/
        async beforeHandle({ request }) {
            let { body, destination, headers } = request

            // @ts-ignore
            const timestamp = headers['X-Signature-Timestamp']
            // @ts-ignore
            const signature = headers['X-Signature-Ed25519']

            if (!timestamp || !signature) return status(401, 'Invalid signature')

            async function onBodyComplete(rawBody: Buffer) {
                const isValid = await verifyKey(rawBody, signature, timestamp, DISCORD_PUBLIC_KEY as string)

                if (!isValid) return status(401, 'Invalid signature')

                const bodyParsed = JSON.parse(rawBody.toString('utf-8')) || {}

                if (bodyParsed.type === InteractionType.Ping) {
                    return responseToSetHeaders(
                        { body: { type: InteractionResponseType.Pong } } as unknown as Response,
                        { headers: { 'Content-Type': 'application/json' } },
                    )
                }

                body = body
            }

            if (body) {
                if (Buffer.isBuffer(body)) {
                    await onBodyComplete(body)
                } else if (typeof body === 'string') {
                    await onBodyComplete(Buffer.from(body, 'utf-8'))
                } else {
                    Logger.warn(
                        'Body was tampered with, probably by some other middleware. We recommend disabling middleware for interaction routes so that req.body is a raw buffer',
                    )
                    await onBodyComplete(Buffer.from(JSON.stringify(body), 'utf-8'))
                }
            } else {
                const chunks: Array<Buffer> = []
                if (destination.includes('data')) {
                    // @ts-ignore
                    chunks.push(body!['data'])
                } else if (destination.includes('end')) {
                    const rawBody = Buffer.concat(chunks)
                    await onBodyComplete(rawBody)
                }
            }
        },
    },
)

Logger.info('Interactions router loaded')

export default Interactions
