import { Request, Response, Express, Router } from 'express';
import { DataManager, Document } from '../lib/';

const apiRouter = Router();

apiRouter.get('/', (_req: Request, res: Response) => {
    res.send('codeberg is ahh');
});

apiRouter.get('/fumos', async (req: Request, res: Response) => {
    try {
        const { has, filetype } = req.query;
        const query: Record<string, any> = {};

        if (has) {
            query.has = { $all: Array.isArray(has) ? has : [has] };
        }

        if (filetype) {
            if (!DataManager.instance.validateFiletype(String(filetype))) {
                return res.status(400).json({
                    error: 'Invalid filetype',
                    message: 'Must be one of: gif, png, jpg, webp',
                });
            }
            query.filetype = filetype;
        }

        let documents: Document[];
        let filtered = false;

        if (query) {
            documents = await DataManager.instance.find(query);
            filtered = true;
        } else {
            documents = await DataManager.instance.getAll();
        }

        res.json({
            filtered,
            data: documents.map((doc) => ({
                id: doc._id.toString(),
                url: doc.url,
                filetype: doc.filetype,
                fumos: doc.fumos,
            })),
        });
    } catch (error) {
        console.error('Error in /fumos:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default apiRouter;
