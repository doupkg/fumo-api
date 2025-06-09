import {
  type APIInteraction,
  type APIInteractionResponse,
  InteractionType,
  InteractionResponseType,
  APIMessageComponentInteraction,
  MessageFlags,
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
        const data = await command?.execute(interaction)
        res.send({
          type: InteractionResponseType.ChannelMessageWithSource,
          data,
        })
        break

      case InteractionType.MessageComponent:
        ((req: Request<never, never, APIMessageComponentInteraction>, res) => {
          const { data: { custom_id }, member } = req.body

          let { author_id } = decodeBuffer(custom_id) as { author_id: string }

          if (author_id != member!.user.id) return res.json({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              content: "sybau",
              flags: MessageFlags.Ephemeral
            }
          })

          res.json({
            type: InteractionResponseType.UpdateMessage,
            data: {
              content: `You have interacted with ${custom_id}`,
              flags: MessageFlags.Ephemeral
            }
          })

        })(req as Request<never, never, APIMessageComponentInteraction>, res)
        break
    }
  },
)

export default interactionsRouter
