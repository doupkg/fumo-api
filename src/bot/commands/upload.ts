import {
    ApplicationCommandType,
    ApplicationCommandOptionType,
    APIChatInputApplicationCommandGuildInteraction,
    APIInteractionResponseCallbackData,
    APISelectMenuOption,
    APIActionRowComponent,
    ComponentType,
    APISelectMenuComponent,
    APIBaseComponent,
} from 'discord-api-types/v10';
import fumos from '../../data/fumos.json';

const selectOptions: APISelectMenuOption[] = fumos.map((fumo) => ({
    label: fumo.value,
    value: fumo.value,
}));

const components: APIActionRowComponent<APISelectMenuComponent>[] = [
    {
        type: ComponentType.ActionRow,
        components: [
            {
                type: ComponentType.StringSelect,
                custom_id: 'fumo_select',
                options: selectOptions,
            },
        ],
    },
];

export const uploadCommand = {
    name: 'upload',
    description: 'Upload a new file to the database (names will be displayed in a select menu)',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'url',
            description: 'The URL of the image',
            type: ApplicationCommandOptionType.String,
        },
        {
            name: 'title',
            description: 'How would you caption this image?',
            type: ApplicationCommandOptionType.String,
        },
    ],
    async execute(
        interaction: APIChatInputApplicationCommandGuildInteraction,
    ): Promise<APIInteractionResponseCallbackData> {
        return {
            content: 'pong',
            components,
        };
    },
};
