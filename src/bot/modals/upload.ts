import {
    APIInteractionResponse,
    APIModalInteractionResponse,
    InteractionResponseType,
    MessageFlags,
} from 'discord-api-types/v10'

export const uploadModal = {
    name: 'upload_modal',
    async execute(_interaction: APIModalInteractionResponse): Promise<APIInteractionResponse> {
        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: 'Recivied cro, handled with modals/',
                flags: MessageFlags.Ephemeral,
            },
        }
    },
}
