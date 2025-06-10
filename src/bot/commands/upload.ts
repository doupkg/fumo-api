import {
    ApplicationCommandType,
    ApplicationCommandOptionType,
    type APIChatInputApplicationCommandGuildInteraction,
    ComponentType,
} from 'discord-api-types/v10'
import fumos from '@/data/fumos.json'

const selectMenuOptions = fumos.map((fumo) => ({
    label: fumo.name,
    value: fumo.value,
}))

const makeActionRow = (userId: string, title: string, url: string) => ({
    type: ComponentType.ActionRow,
    components: [
        {
            type: ComponentType.StringSelect,
            custom_id: [userId, title, url].join('^'),
            options: selectMenuOptions,
        },
    ],
})

export const uploadCommand = {
    name: 'upload',
    description: 'Upload a new file to the database (names will be displayed in a select menu)',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'url',
            description: 'The URL of the image to upload',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'title',
            description: 'The title of the image',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    async execute(interaction: APIChatInputApplicationCommandGuildInteraction): Promise<void> {
        console.dir(interaction.data.options, { depth: null })
        return
    },
}
