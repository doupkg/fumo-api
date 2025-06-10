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

    try {
      switch (interaction.type) {
        case InteractionType.Ping:
          console.log('Ping received')
          res.send({ type: InteractionResponseType.Pong })
          break

        case InteractionType.ApplicationCommand:
          const command = commandCollection.get(interaction.data.name)
          const cmd_data = await command?.execute(interaction)
          console.dir(cmd_data, { depth: null })
          if (interaction.data.name === "upload") {
            res.send({
              type: InteractionResponseType.Modal,
              data: {
                custom_id: "upload_modal",
                title: "Submit a Fumo Image",
                components: [{
                  type: 1,
                  components: [{
                    type: 4,
                    custom_id: "upload_title",
                    label: "Title for your Image",
                    style: 1,
                    min_lenght: 1,
                    max_lenght: 100,
                    placeholder: "How you would call this image?",
                    required: true
                  }]
                }],
              }
            })
          } else {
            res.send({
              type: InteractionResponseType.ChannelMessageWithSource,
              data: cmd_data,
            })
          }
          break

        case InteractionType.ModalSubmit:
          const {
            data: { custom_id },
          } = interaction

          const { author_id } = decodeBuffer(custom_id) as {
            author_id: string
          }

          return res.send({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              content: `The original command was executed by ${author_id}, you have interacted with it`,
              flags: MessageFlags.Ephemeral,
            },
          })
      }
    } catch (error) {
      console.error(error)
      res.send({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: { content: 'An error occurred', flags: MessageFlags.Ephemeral },
      })
    }
  },
)

export default interactionsRouter
