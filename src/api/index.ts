import express, { Request, Response } from 'express';
import { verifyKeyMiddleware } from 'discord-interactions';
import {
    APIInteraction,
    APIInteractionResponse,
    InteractionType,
    InteractionResponseType,
} from 'discord-api-types/v10';

const app = express();
const PORT = process.env.PORT || 3000;
const { DISCORD_PUBLIC_KEY, DISCORD_INTERACTIONS_ENDPOINT } = process.env;

export default function initApi() {
    app.get('/', (_req: Request, res: Response) => {
        res.send('codeberg is ahh');
    });

    if (!DISCORD_PUBLIC_KEY || !DISCORD_INTERACTIONS_ENDPOINT) {
        throw new Error('Missing environment variables');
    }

    app.post(
        DISCORD_INTERACTIONS_ENDPOINT,
        verifyKeyMiddleware(DISCORD_PUBLIC_KEY),
        (req: Request<never, APIInteractionResponse, APIInteraction>, res: Response) => {
            const interaction = req.body;

            if (interaction.type === InteractionType.Ping) {
                res.send({ type: InteractionResponseType.Pong });
                console.log('Ping received');
            }
        },
    );

    app.listen(PORT, () => {
        console.log(`port ${PORT}`);
    });
}
