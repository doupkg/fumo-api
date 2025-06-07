import 'dotenv/config';
import express from 'express';
import apiRouter from './api';
import interactionsRouter from './bot';

const port = process.env.PORT || 3000;

express()
    .use('/interactions', interactionsRouter)
    .use('/', apiRouter)
    .use(express.json())
    .listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
