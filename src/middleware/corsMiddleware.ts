import cors from 'cors';

export const corsMiddleware = cors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
    credentials: false
});
