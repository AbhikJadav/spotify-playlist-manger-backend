import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import authRoutes from './routes/authRoutes';
import playlistRoutes from './routes/playlistRoutes';
import spotifyRoutes from './routes/spotify.routes';
import { errorHandler } from './middleware/errorHandler';
import cors from 'cors';

dotenv.config();

const app = express();

// Enable CORS with specific options
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://spotify-playlist-manager.vercel.app',
        'https://spotify-playlist-manager-git-main.vercel.app',
        'https://spotify-playlist-manager-frontend-umber.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/spotify', spotifyRoutes);

// Serve index.html for all other routes (for client-side routing)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use(errorHandler);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spotify-playlist-manager')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3001;

mongoose.connection.on('connected', () => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
    console.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    process.exit(1);
});

export default app;
