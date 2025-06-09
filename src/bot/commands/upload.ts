import {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  type APIChatInputApplicationCommandGuildInteraction,
  type APIInteractionResponseCallbackData,
  type APISelectMenuOption,
  type APIActionRowComponent,
  ComponentType,
  type APISelectMenuComponent,
  MessageFlags,
} from 'discord-api-types/v10'
import Fumos from '../../data/fumos.json'

const selectOptions: APISelectMenuOption[] = Fumos.map((fumo) => ({
  label: fumo.name,
  value: fumo.value,
}))

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
]

export const uploadCommand = {
  name: 'upload',
  description: 'Upload a new file to the database (names will be displayed in a select menu)',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'url',
      description: 'The URL of the image, it must to end with a valid extension!',
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
      embeds: [{ description: 'StringSelect' }],
      flags: MessageFlags.IsComponentsV2,
      components,
    }
  },
}
