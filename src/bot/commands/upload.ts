import {
  ApplicationCommandType,
  type APIChatInputApplicationCommandGuildInteraction,
} from 'discord-api-types/v10'

export const uploadCommand = {
  name: 'upload',
  description: 'Upload a new file to the database (names will be displayed in a select menu)',
  type: ApplicationCommandType.ChatInput,
  async execute(
    _interaction: APIChatInputApplicationCommandGuildInteraction & {
      data: { options: { value: string }[] }
    },
  ): Promise<void> {
    return
  },
}
