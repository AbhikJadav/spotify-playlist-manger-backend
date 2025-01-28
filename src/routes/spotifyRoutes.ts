import express from 'express';
import { getSpotifyAuthUrl, getSpotifyToken } from '../controllers/spotifyAuthController';

const router = express.Router();

router.get('/auth-url', getSpotifyAuthUrl);
router.post('/token', getSpotifyToken);

export default router;
