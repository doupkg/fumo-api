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
        return {
            type: InteractionResponseType.UpdateMessage,
            data: {
                embeds: [
                    {
                        ...interaction.message.embeds[0],
                        fields: [
                            {
                                name: this.name,
                                value: interaction.data.values.join(' '),
                            },
                        ],
                    },
                ],
            },
        }
    },
}
