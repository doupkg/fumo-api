import {
    APIInteraction,
    APIInteractionResponse,
    InteractionType,
    InteractionResponseType,
} from 'discord-api-types/v10';
import { Request, Response, Router } from 'express';
import { verifyKeyMiddleware } from 'discord-interactions';

const { DISCORD_PUBLIC_KEY } = process.env;

if (!DISCORD_PUBLIC_KEY) {
    throw new Error('Missing environment variables');
}

const interactionsRouter = Router();

interactionsRouter.post(
    '/',
    verifyKeyMiddleware(DISCORD_PUBLIC_KEY),
    (req: Request<never, APIInteractionResponse, APIInteraction>, res: Response) => {
        const interaction = req.body;

        switch (interaction.type) {
            case InteractionType.Ping:
                console.log('Ping received');
                res.send({ type: InteractionResponseType.Pong });
                break;

            case InteractionType.ApplicationCommand:
                console.log('Application command received');
                res.send({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        content: 'pong',
                    },
                });
                break;
        }
    },
);

export default interactionsRouter;
