import {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  type APIChatInputApplicationCommandGuildInteraction,
  type APIInteractionResponseCallbackData,
  type APISelectMenuOption,
  ComponentType,
} from 'discord-api-types/v10'
import Fumos from '../../data/fumos.json'
import { encodeBuffer } from '@/lib'

const selectOptions: APISelectMenuOption[] = Fumos.map((fumo) => ({
  label: fumo.name,
  value: fumo.value,
}))

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
    interaction: APIChatInputApplicationCommandGuildInteraction,
  ): Promise<APIInteractionResponseCallbackData> {
    return {
      embeds: [{ description: 'StringSelect' }],
      components: [{
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.StringSelect,
            custom_id: encodeBuffer({ prev_data: interaction.data, author_id: interaction.member.user.id }),
            options: selectOptions,
          },
        ],
      },],
    }
  },
}
