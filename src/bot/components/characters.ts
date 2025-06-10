import {
    APIInteractionResponse,
    APIMessageComponentSelectMenuInteraction,
    InteractionResponseType,
    APIEmbedField,
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
                        fields: interaction.message.embeds[0]?.fields?.push({
                            name: this.name,
                            value: interaction.data.values.join(' '),
                        }) as unknown as APIEmbedField[],
                    },
                ],
            },
        }
    },
}
