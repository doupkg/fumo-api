import {
    APIInteraction,
    APIInteractionResponse,
    InteractionType,
    InteractionResponseType,
} from 'discord-api-types/v10';
import { Request, Response, Router } from 'express';
import { verifyKeyMiddleware } from 'discord-interactions';
import commands from './commands';

const { DISCORD_PUBLIC_KEY } = process.env;

if (!DISCORD_PUBLIC_KEY) {
    throw new Error('DISCORD_PUBLIC_KEY environment variable is missing');
}

const commandCollection = new Map<string, any>(commands.map((command) => [command.name, command]));

const interactionsRouter = Router();

interactionsRouter.post(
    '/',
    verifyKeyMiddleware(DISCORD_PUBLIC_KEY),
    async (req: Request<never, APIInteractionResponse, APIInteraction>, res: Response) => {
        const interaction = req.body;

        switch (interaction.type) {
            case InteractionType.Ping:
                console.log('Ping received');
                res.send({ type: InteractionResponseType.Pong });
                break;

            case InteractionType.ApplicationCommand:
                const command = commandCollection.get(interaction.data.name);
                const data = await command?.execute(interaction);
                res.send({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data,
                });
                break;
        }
    },
);

export default interactionsRouter;
