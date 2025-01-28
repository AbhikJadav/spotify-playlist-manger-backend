import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import SpotifyWebApi from 'spotify-web-api-node';

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

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Search tracks
router.get('/search', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q: query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Set access token from user's session or refresh if needed
    const accessToken = req.user?.spotifyAccessToken;
    if (!accessToken) {
      return res.status(401).json({ message: 'No access token found' });
    }
    
    spotifyApi.setAccessToken(accessToken);

    const response = await spotifyApi.searchTracks(query as string, { limit: 20 });
    
    if (!response.body.tracks) {
      return res.status(404).json({ message: 'No tracks found' });
    }

    // Transform the response to match our Song interface
    const tracks: Song[] = response.body.tracks.items.map(track => ({
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

    return res.json({ tracks });
  } catch (error) {
    console.error('Error searching tracks:', error);
    return res.status(500).json({ message: 'Error searching tracks' });
  }
});

// Add track to playlist
router.post('/playlists/:playlistId/tracks', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { playlistId } = req.params;
    const { uri } = req.body;

    if (!uri) {
      return res.status(400).json({ message: 'Track URI is required' });
    }

    // Set access token from user's session
    const accessToken = req.user?.spotifyAccessToken;
    if (!accessToken) {
      return res.status(401).json({ message: 'No access token found' });
    }
    
    spotifyApi.setAccessToken(accessToken);

    await spotifyApi.addTracksToPlaylist(playlistId, [uri]);
    return res.json({ message: 'Track added successfully' });
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    return res.status(500).json({ message: 'Error adding track to playlist' });
  }
});

// Get track recommendations
router.get('/recommendations', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { seed_tracks } = req.query;
    if (!seed_tracks) {
      return res.status(400).json({ message: 'Seed tracks are required' });
    }

    // Set access token from user's session
    const accessToken = req.user?.spotifyAccessToken;
    if (!accessToken) {
      return res.status(401).json({ message: 'No access token found' });
    }
    
    spotifyApi.setAccessToken(accessToken);

    const response = await spotifyApi.getRecommendations({
      seed_tracks: (seed_tracks as string).split(','),
      limit: 20
    });

    if (!response.body.tracks) {
      return res.status(404).json({ message: 'No tracks found' });
    }

    // Transform the response to match our Song interface
    const tracks: Song[] = response.body.tracks.map(track => ({
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

    return res.json({ tracks });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return res.status(500).json({ message: 'Error getting recommendations' });
  }
});

// Get user's Spotify playlists
router.get('/playlists', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const accessToken = req.user?.spotifyAccessToken;
    if (!accessToken) {
      return res.status(401).json({ message: 'No access token found' });
    }
    
    spotifyApi.setAccessToken(accessToken);

    const response = await spotifyApi.getUserPlaylists();
    const playlists = response.body.items.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      images: playlist.images,
      tracks: playlist.tracks,
      owner: playlist.owner
    }));

    return res.json({ playlists });
  } catch (error) {
    console.error('Error getting user playlists:', error);
    return res.status(500).json({ message: 'Error getting user playlists' });
  }
});

export default router;
