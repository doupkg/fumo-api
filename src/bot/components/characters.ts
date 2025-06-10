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
        const prev_fields = interaction.message.embeds[0]?.fields ?? []
        if (prev_fields.find((e) => e.name === this.name)) {
            prev_fields.pop()
        }
        prev_fields.push(Object({ name: this.name, value: interaction.data.values }))
        return {
            type: InteractionResponseType.UpdateMessage,
            data: {
                embeds: [
                    {
                        ...interaction.message.embeds[0],
                        fields: prev_fields,
                    },
                ],
            },
        }
    },
}
