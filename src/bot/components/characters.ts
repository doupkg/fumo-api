import {
    APIEmbedField,
    APIInteractionResponse,
    APIMessageComponentSelectMenuInteraction,
    InteractionResponseType,
} from 'discord-api-types/v10'
import Characters from '@/data/characters.json'

export const charactersComponent = {
    name: 'characters_input',
    async execute(
        interaction: APIMessageComponentSelectMenuInteraction,
    ): Promise<APIInteractionResponse> {
        const prev_fields = interaction.message.embeds[0]?.fields ?? null
        if (prev_fields!.find((e) => e.name === this.name)) {
            prev_fields!.pop()
        }
        prev_fields!.push(
            Object({
                name: this.name,
                value: interaction.data.values
                    .map((e) => Characters.find((x) => x.value === e)?.name)
                    .join(', '),
            }),
        )
        return {
            type: InteractionResponseType.UpdateMessage,
            data: {
                embeds: [
                    {
                        ...interaction.message.embeds[0],
                        fields: prev_fields as APIEmbedField[],
                    },
                ],
            },
        }
    },
}
