import {
    APIInteraction,
    APIInteractionResponse,
    InteractionType,
    InteractionResponseType,
    MessageFlags,
} from 'discord-api-types/v10'
import { Elysia } from 'elysia'
import { verifyKeyMiddleware } from 'discord-interactions'
import Commands from './commands'
import Components from './components/'
import Modals from './modals'

const { DISCORD_PUBLIC_KEY } = process.env

if (!DISCORD_PUBLIC_KEY) {
    throw new Error('DISCORD_PUBLIC_KEY environment variable is missing')
}

const commandCollection = new Map<string, any>(Commands.map((command) => [command.name, command]))
const componentCollection = new Map<string, any>(Components.map((component) => [component.name, component]))
const modalCollection = new Map<string, any>(Modals.map((modal) => [modal.name, modal]))

const interactionsRouter = new Elysia()

interactionsRouter.post(
    '/',
    verifyKeyMiddleware(DISCORD_PUBLIC_KEY),
    async (req: never | APIInteractionResponse | APIInteraction, res: Response) => {
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

                case InteractionType.MessageComponent:
                    const component = componentCollection.get(interaction.data.custom_id.split(':')[0])
                    const component_data = await component?.execute(interaction)

                    res.send(component_data)

                case InteractionType.ModalSubmit:
                    const modal = modalCollection.get(interaction.data.custom_id)
                    const modal_data = await modal?.execute(interaction)

                    res.send(modal_data)
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
