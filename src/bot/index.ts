import {
  type APIInteraction,
  type APIInteractionResponse,
  InteractionType,
  InteractionResponseType,
  MessageFlags,
  APIChatInputApplicationCommandInteraction,
} from 'discord-api-types/v10'
import { type Request, type Response, Router } from 'express'
import { verifyKeyMiddleware } from 'discord-interactions'
import Commands from './commands'

const { DISCORD_PUBLIC_KEY } = process.env

if (!DISCORD_PUBLIC_KEY) {
  throw new Error('DISCORD_PUBLIC_KEY environment variable is missing')
}

const commandCollection = new Map<string, any>(Commands.map((command) => [command.name, command]))

function decodeBuffer(encoded: string) {
  const buffer = Buffer.from(encoded, 'base64').toString('ascii')

  return JSON.parse(buffer)
}

const interactionsRouter = Router()

interactionsRouter.post(
  '/',
  verifyKeyMiddleware(DISCORD_PUBLIC_KEY),
  async (req: Request<never, APIInteractionResponse, APIInteraction>, res: Response) => {
    const interaction = req.body

    switch (interaction.type) {
      case InteractionType.Ping:
        console.log('Ping received')
        res.send({ type: InteractionResponseType.Pong })
        break

      case InteractionType.ApplicationCommand:
        const command = commandCollection.get(interaction.data.name)
        const cmd_data = await command?.execute(interaction)
        res.send({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: cmd_data,
        })
        break

      case InteractionType.MessageComponent:
        const {
          data: { custom_id },
        } = interaction

        const { prev_data, author_id } = decodeBuffer(custom_id) as { prev_data: APIChatInputApplicationCommandInteraction, author_id: string }

        return res.send({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: `The original command was executed by ${author_id}, you have interacted with ${prev_data.data.options}`,
            flags: MessageFlags.Ephemeral,
          },
        })
    }
  },
)

export default interactionsRouter
