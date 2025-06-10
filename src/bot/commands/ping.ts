import {
    ApplicationCommandType,
    APIChatInputApplicationCommandGuildInteraction,
    InteractionResponseType,
    APIInteractionResponse,
} from 'discord-api-types/v10'

import { DataManager } from '../../lib/manager'

export const pingCommand = {
    name: 'ping',
    description: 'Errrrrrrrrmmmmmm',
    type: ApplicationCommandType.ChatInput,
    async execute(
        _interaction: APIChatInputApplicationCommandGuildInteraction,
    ): Promise<APIInteractionResponse> {
        const start = Date.now()
        const count = await DataManager.instance.db?.countDocuments()
        const end = Date.now()
        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `Counted ${count} documents in ${end - start}ms`,
            },
        }
    },
}
