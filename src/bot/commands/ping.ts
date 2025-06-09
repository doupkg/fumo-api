import {
  ApplicationCommandType,
  APIChatInputApplicationCommandGuildInteraction,
  APIInteractionResponseCallbackData,
} from 'discord-api-types/v10';

import { DataManager } from '../../lib/manager';

export const pingCommand = {
  name: 'ping',
  description: 'Errrrrrrrrmmmmmm',
  type: ApplicationCommandType.ChatInput,
  async execute(
    _interaction: APIChatInputApplicationCommandGuildInteraction,
  ): Promise<APIInteractionResponseCallbackData> {
    const start = Date.now();
    const count = await DataManager.instance.db?.countDocuments();
    const end = Date.now();
    return { content: `Counted ${count} documents in ${end - start}ms` };
  },
};
