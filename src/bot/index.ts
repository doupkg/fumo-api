import {
    APIInteraction,
    APIInteractionResponse,
    InteractionType,
    InteractionResponseType,
    MessageFlags,
    ComponentType,
    TextInputStyle,
} from 'discord-api-types/v10'
import { type Request, type Response, Router } from 'express'
import { verifyKeyMiddleware } from 'discord-interactions'
import Commands from './commands'

const { DISCORD_PUBLIC_KEY } = process.env

if (!DISCORD_PUBLIC_KEY) {
    throw new Error('DISCORD_PUBLIC_KEY environment variable is missing')
}

const commandCollection = new Map<string, any>(Commands.map((command) => [command.name, command]))

const interactionsRouter = Router()

interactionsRouter.post(
    '/',
    verifyKeyMiddleware(DISCORD_PUBLIC_KEY),
    async (req: Request<never, APIInteractionResponse, APIInteraction>, res: Response) => {
        const interaction = req.body

        try {
            switch (interaction.type) {
                case InteractionType.Ping:
                    console.log('Ping received')
                    res.send({ type: InteractionResponseType.Pong })
                    break

                case InteractionType.ApplicationCommand:
                    const command = commandCollection.get(interaction.data.name)
                    const cmd_data = await command?.execute(interaction)
                    console.dir(cmd_data, { depth: null })

                    res.send(cmd_data)
                    break

                case InteractionType.ModalSubmit:
                    res.send({
                        type: InteractionResponseType.DeferredChannelMessageWithSource,
                    })
                    res.send({
                        type: InteractionResponseType.DeferredMessageUpdate,
                        data: {
                            content:
                                'I received da modal cro.., its id is' + interaction.data.custom_id,
                        },
                    })

                    break
            }
        } catch (error) {
            console.error(error)
            res.send({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: { content: 'An error occurred', flags: MessageFlags.Ephemeral },
            })
        }
    },
)

export default interactionsRouter
