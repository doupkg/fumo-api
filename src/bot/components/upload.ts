import { decodeBuffer } from '@/lib'
import {
    APIInteractionResponse,
    APIMessageComponentInteraction,
    InteractionResponseType,
} from 'discord-api-types/v10'

export const uploadComponent = {
    name: 'upload_component',
    async execute(interaction: APIMessageComponentInteraction): Promise<APIInteractionResponse> {
        const ctx: Record<string, string> = decodeBuffer(interaction.data.custom_id)

        return {
            type: InteractionResponseType.UpdateMessage,
            data: {
                content: 'ActionRow recivied, the modal title was: ' + ctx,
            },
        }
    },
}
