import cors from 'cors';

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://spotify-playlist-manager.vercel.app',
    'https://spotify-playlist-manager-git-main.vercel.app',
    'https://spotify-playlist-manager-frontend-umber.vercel.app',
    'https://spotify-playlist-manger-backend-jvdysbc1t.vercel.app'
];

export const corsMiddleware = cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
});