import cors from 'cors';

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://spotify-playlist-manager.vercel.app',
    'https://spotify-playlist-manager-git-main.vercel.app',
    'https://spotify-playlist-manager-frontend-umber.vercel.app'
];

export const corsMiddleware = cors({
    origin: (origin, callback) => {
        console.log('Incoming request from origin:', origin);  // Log the origin

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    credentials: true,
});
