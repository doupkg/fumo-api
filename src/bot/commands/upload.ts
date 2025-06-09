import {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  APIChatInputApplicationCommandGuildInteraction,
  APIInteractionResponseCallbackData,
  APISelectMenuOption,
  APIActionRowComponent,
  ComponentType,
  APISelectMenuComponent,
} from 'discord-api-types/v10';
import fumos from '../../data/fumos.json';

const selectOptions: APISelectMenuOption[] = fumos.map((fumo) => ({
  label: fumo.name,
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
      description: 'The URL of the image, it has to end with a valid extension!',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'title',
      description: 'How would you caption this image?',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  async execute(
    _interaction: APIChatInputApplicationCommandGuildInteraction,
  ): Promise<APIInteractionResponseCallbackData> {
    return {
      content: 'pong',
      components,
    };
  },
};
