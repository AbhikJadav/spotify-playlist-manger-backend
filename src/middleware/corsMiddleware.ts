import cors from 'cors';

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://spotify-manger-backend.vercel.app',
    'https://spotify-playlist-manager.vercel.app',
    'https://spotify-playlist-manager-git-main.vercel.app',
    'https://spotify-playlist-manager-frontend-umber.vercel.app'
];

export const corsMiddleware = cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: false
});
