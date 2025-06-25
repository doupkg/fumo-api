import { APIInteraction, InteractionType, InteractionResponseType } from 'discord-api-types/v10'
import { Elysia } from 'elysia'
import { discordInteractionsMiddleware, Logger } from '@/lib'
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

const Interactions = new Elysia({ prefix: '/interactions' })

Interactions.post(
    '/',
    async ({ body }) => {
        const interaction = body as APIInteraction

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
    },
    {
        beforeHandle: discordInteractionsMiddleware,
    },
)
Logger.info('Interactions router loaded')

export default Interactions
