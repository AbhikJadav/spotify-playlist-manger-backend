import express from 'express';
import { authenticateToken } from '../middleware/auth';
import SpotifyWebApi from 'spotify-web-api-node';

const router = express.Router();

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Search tracks
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q: query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Set access token from user's session or refresh if needed
    const accessToken = req.user.spotifyAccessToken;
    spotifyApi.setAccessToken(accessToken);

    const response = await spotifyApi.searchTracks(query as string, { limit: 20 });
    
    // Transform the response to match our Song interface
    const tracks = response.body.tracks.items.map(track => ({
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
  } catch (error: any) {
    console.error('Error searching tracks:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add track to playlist
router.post('/playlists/:playlistId/tracks', authenticateToken, async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { uri } = req.body;

    if (!uri) {
      return res.status(400).json({ message: 'Track URI is required' });
    }

    // Set access token from user's session
    const accessToken = req.user.spotifyAccessToken;
    spotifyApi.setAccessToken(accessToken);

    await spotifyApi.addTracksToPlaylist(playlistId, [uri]);
    res.json({ message: 'Track added successfully' });
  } catch (error: any) {
    console.error('Error adding track to playlist:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get track recommendations
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const { seed_tracks } = req.query;
    if (!seed_tracks) {
      return res.status(400).json({ message: 'Seed tracks are required' });
    }

    // Set access token from user's session
    const accessToken = req.user.spotifyAccessToken;
    spotifyApi.setAccessToken(accessToken);

    const response = await spotifyApi.getRecommendations({
      seed_tracks: (seed_tracks as string).split(','),
      limit: 20
    });

    // Transform the response to match our Song interface
    const tracks = response.body.tracks.map(track => ({
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
  } catch (error: any) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's Spotify playlists
router.get('/playlists', authenticateToken, async (req, res) => {
  try {
    const accessToken = req.user.spotifyAccessToken;
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

    res.json({ playlists });
  } catch (error: any) {
    console.error('Error getting user playlists:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
