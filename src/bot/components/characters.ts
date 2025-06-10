import {
    APIInteractionResponse,
    APIMessageComponentSelectMenuInteraction,
    InteractionResponseType,
} from 'discord-api-types/v10'

export const charactersComponent = {
    name: 'characters_input',
    async execute(
        interaction: APIMessageComponentSelectMenuInteraction,
    ): Promise<APIInteractionResponse> {
        interaction.message.embeds[0]?.fields?.push({
            name: this.name,
            value: interaction.data.values.join(' '),
        })
        return {
            type: InteractionResponseType.UpdateMessage,
            data: {
                embeds: [
                    {
                        ...interaction.message.embeds[0],
                    },
                ],
            },
        }
    },
}
