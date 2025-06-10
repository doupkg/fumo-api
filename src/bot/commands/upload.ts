import {
    ComponentType,
    TextInputStyle,
    ApplicationCommandType,
    APIInteractionResponse,
    InteractionResponseType,
    ApplicationCommandOptionType,
    APIComponentInModalActionRow,
    APIModalInteractionResponseCallbackData,
    APIChatInputApplicationCommandGuildInteraction,
} from 'discord-api-types/v10'
import fumos from '@/data/fumos.json'

const selectMenuOptions = fumos.map((fumo) => ({
    label: fumo.name,
    value: fumo.value,
}))

const baseComponent: Omit<APIComponentInModalActionRow, 'custom_id' | 'label'> = {
    type: ComponentType.TextInput,
    style: TextInputStyle.Short,
    required: true,
    min_length: 2,
}
const titleComponent: APIComponentInModalActionRow = {
    ...baseComponent,
    custom_id: 'title_input',
    label: 'Title this image',
    max_length: 60,
}
const urlComponent: APIComponentInModalActionRow = {
    ...baseComponent,
    custom_id: 'url_input',
    label: 'The file URL',
}
const modal: APIModalInteractionResponseCallbackData = {
    title: 'aaaa',
    custom_id: 'upload_command_modal',
    components: [titleComponent, urlComponent].map((component) => ({
        type: ComponentType.ActionRow,
        components: [component],
    })),
}

export const uploadCommand = {
    name: 'upload',
    description: 'Upload a new file to the database (names will be displayed in a select menu)',
    type: ApplicationCommandType.ChatInput,
    async execute(
        _interaction: APIChatInputApplicationCommandGuildInteraction,
    ): Promise<APIInteractionResponse> {
        return {
            type: InteractionResponseType.Modal,
            data: modal,
        }
    },
}
