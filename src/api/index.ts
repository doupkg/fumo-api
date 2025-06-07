import { Request, Response, Express, Router } from 'express';

const apiRouter = Router();

apiRouter.get('/', (_req: Request, res: Response) => {
    res.send('codeberg is ahh');
});

export default apiRouter;
