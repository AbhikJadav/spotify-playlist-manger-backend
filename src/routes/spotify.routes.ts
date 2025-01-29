import express, { Request, Response } from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/authMiddleware';

interface AuthenticatedRequest extends Request {
  user?: {
    spotifyAccessToken: string;
  };
}

interface Song {
  spotifyId: string;
  name: string;
  artists: { id: string; name: string }[];
  artist: string;
  album: string;
  albumId: string;
  duration: number;
  albumArt: string | undefined;
  uri: string;
  previewUrl: string | null;
}

const router = express.Router();

// Middleware to check if user is authenticated
router.use(authMiddleware);

// Get user's Spotify playlists
router.get('/playlists', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const accessToken = req.user?.spotifyAccessToken;
    if (!accessToken) {
      res.status(401).json({ message: 'No Spotify access token found' });
      return;
    }

    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const playlists = response.data.items.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      images: playlist.images,
      tracks: playlist.tracks,
      owner: playlist.owner
    }));

    res.json({ playlists });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playlists', error });
  }
});

// Get tracks from a specific playlist
router.get('/playlist/:id/tracks', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const accessToken = req.user?.spotifyAccessToken;
    if (!accessToken) {
      res.status(401).json({ message: 'No Spotify access token found' });
      return;
    }

    const { id } = req.params;
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const tracks: Song[] = response.data.items.map(track => ({
      spotifyId: track.track.id,
      name: track.track.name,
      artists: track.track.artists.map(artist => ({
        id: artist.id,
        name: artist.name
      })),
      artist: track.track.artists[0].name, // Primary artist
      album: track.track.album.name,
      albumId: track.track.album.id,
      duration: track.track.duration_ms,
      albumArt: track.track.album.images[0]?.url,
      uri: track.track.uri,
      previewUrl: track.track.preview_url
    }));

    res.json({ tracks });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playlist tracks', error });
  }
});

// Search tracks
router.get('/search', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const accessToken = req.user?.spotifyAccessToken;
    if (!accessToken) {
      res.status(401).json({ message: 'No Spotify access token found' });
      return;
    }

    const { q } = req.query;
    if (!q) {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    const response = await axios.get('https://api.spotify.com/v1/search', {
      params: {
        q,
        type: 'track',
        limit: 20
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const tracks: Song[] = response.data.tracks.items.map(track => ({
      spotifyId: track.id,
      name: track.name,
      artists: track.artists.map(artist => ({
        id: artist.id,
        name: artist.name
      })),
      artist: track.artists[0].name, // Primary artist
      album: track.album.name,
      albumId: track.album.id,
      duration: track.duration_ms,
      albumArt: track.album.images[0]?.url,
      uri: track.uri,
      previewUrl: track.preview_url
    }));

    res.json({ tracks });
  } catch (error) {
    res.status(500).json({ message: 'Error searching tracks', error });
  }
});

// Add track to playlist
router.post('/playlists/:playlistId/tracks', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const accessToken = req.user?.spotifyAccessToken;
    if (!accessToken) {
      res.status(401).json({ message: 'No Spotify access token found' });
      return;
    }

    const { playlistId } = req.params;
    const { uri } = req.body;

    if (!uri) {
      res.status(400).json({ message: 'Track URI is required' });
      return;
    }

    await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      uris: [uri]
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    res.json({ message: 'Track added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding track to playlist', error });
  }
});

// Get track recommendations
router.get('/recommendations', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const accessToken = req.user?.spotifyAccessToken;
    if (!accessToken) {
      res.status(401).json({ message: 'No Spotify access token found' });
      return;
    }

    const { seed_tracks } = req.query;
    if (!seed_tracks) {
      res.status(400).json({ message: 'Seed tracks are required' });
      return;
    }

    const response = await axios.get('https://api.spotify.com/v1/recommendations', {
      params: {
        seed_tracks: (seed_tracks as string).split(','),
        limit: 20
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const tracks: Song[] = response.data.tracks.map(track => ({
      spotifyId: track.id,
      name: track.name,
      artists: track.artists.map(artist => ({
        id: artist.id,
        name: artist.name
      })),
      artist: track.artists[0].name, // Primary artist
      album: track.album.name,
      albumId: track.album.id,
      duration: track.duration_ms,
      albumArt: track.album.images[0]?.url,
      uri: track.uri,
      previewUrl: track.preview_url
    }));

    res.json({ tracks });
  } catch (error) {
    res.status(500).json({ message: 'Error getting recommendations', error });
  }
});

export default router;
