import { Request, Response } from 'express';
import axios from 'axios';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3001/callback';

export const getSpotifyAuthUrl = (req: Request, res: Response) => {
    try {
        if (!CLIENT_ID) {
            throw new Error('SPOTIFY_CLIENT_ID is not configured');
        }

        const scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private';
        const state = Math.random().toString(36).substring(7);
        
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            response_type: 'code',
            redirect_uri: REDIRECT_URI,
            scope: scope,
            state: state
        });

        const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
        res.json({ url: authUrl });
    } catch (error) {
        console.error('Error generating auth URL:', error);
        res.status(500).json({ error: 'Failed to generate Spotify authorization URL' });
    }
};

export const getSpotifyToken = async (req: Request, res: Response) => {
    try {
        if (!CLIENT_ID || !CLIENT_SECRET) {
            throw new Error('Spotify credentials are not configured');
        }

        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            new URLSearchParams({
                code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code'
            }).toString(),
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        res.json(response.data);
    } catch (error: any) {
        console.error('Error getting Spotify token:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to get Spotify token',
            details: error.response?.data || error.message
        });
    }
};
