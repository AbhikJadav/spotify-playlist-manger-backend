import { Request, Response } from 'express';
import Playlist from '../models/Playlist';
import User from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: any;  // This will be populated by authMiddleware
}

export const createPlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { name, description, isPublic } = req.body;

    console.log('Creating playlist for user:', userId, 'with data:', { name, description, isPublic });

    const newPlaylist = new Playlist({
      name,
      description,
      user: userId,  // Make sure to set the user ID
      isPublic: isPublic || false,
      songs: []
    });

    console.log('Created playlist object:', newPlaylist);
    const savedPlaylist = await newPlaylist.save();
    console.log('Saved playlist:', savedPlaylist);

    // Update user's playlists
    await User.findByIdAndUpdate(userId, { 
      $push: { playlists: savedPlaylist._id } 
    });

    res.status(201).json(savedPlaylist);
  } catch (error) {
    console.error('Error in createPlaylist:', error);
    res.status(500).json({ message: 'Error creating playlist', error: error.message });
  }
};

export const getUserPlaylists = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('Fetching playlists for user:', userId);
    const playlists = await Playlist.find({ user: userId })
      .populate('songs')  // Populate the songs array if needed
      .lean();  // Convert to plain JavaScript objects
    
    console.log('Found playlists:', playlists);
    res.json(playlists);
  } catch (error) {
    console.error('Error in getUserPlaylists:', error);
    res.status(500).json({ message: 'Error fetching playlists', error: error.message });
  }
};

export const updatePlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { playlistId } = req.params;
    const { name, description, isPublic } = req.body;

    const userId = req.user?._id;
    
    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('Updating playlist:', playlistId);
    const playlist = await Playlist.findOneAndUpdate(
      { _id: playlistId, user: userId },
      { name, description, isPublic },
      { new: true }
    );

    if (!playlist) {
      console.error('Playlist not found:', playlistId);
      return res.status(404).json({ message: 'Playlist not found' });
    }

    console.log('Playlist updated:', playlist);
    res.json(playlist);
  } catch (error) {
    console.error('Error in updatePlaylist:', error);
    res.status(500).json({ message: 'Error updating playlist', error: error.message });
  }
};

export const deletePlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { playlistId } = req.params;

    const userId = req.user?._id;
    
    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('Deleting playlist:', playlistId);
    const playlist = await Playlist.findOneAndDelete({ 
      _id: playlistId, 
      user: userId 
    });

    if (!playlist) {
      console.error('Playlist not found:', playlistId);
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Remove playlist reference from user
    await User.findByIdAndUpdate(userId, { 
      $pull: { playlists: playlistId } 
    });

    console.log('Playlist deleted:', playlistId);
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error in deletePlaylist:', error);
    res.status(500).json({ message: 'Error deleting playlist', error: error.message });
  }
};

export const addSongToPlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { playlistId } = req.params;
    const { song } = req.body;

    if (!song) {
      console.error('No song data provided');
      return res.status(400).json({ message: 'Song data is required' });
    }

    const userId = req.user?._id;
    
    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate song data
    if (!song.spotifyId || !song.title || !song.artist || !song.album) {
      console.error('Invalid song data:', song);
      return res.status(400).json({ message: 'Invalid song data' });
    }

    // Find playlist and check if song exists
    const existingPlaylist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!existingPlaylist) {
      console.error('Playlist not found:', playlistId);
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const songExists = existingPlaylist.songs.some(s => s.spotifyId === song.spotifyId);
    if (songExists) {
      console.error('Song already exists in playlist:', song.spotifyId);
      return res.status(400).json({ message: 'Song already exists in playlist' });
    }

    // Add song to playlist
    console.log('Adding song to playlist:', song);
    const updatedPlaylist = await Playlist.findOneAndUpdate(
      { _id: playlistId, user: userId },
      { 
        $push: { 
          songs: {
            spotifyId: song.spotifyId,
            title: song.title,
            artist: song.artist,
            album: song.album,
            duration: song.duration,
            previewUrl: song.previewUrl
          } 
        } 
      },
      { new: true }
    );

    if (!updatedPlaylist) {
      console.error('Playlist not found:', playlistId);
      return res.status(404).json({ message: 'Playlist not found' });
    }

    console.log('Song added to playlist:', updatedPlaylist);
    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Error in addSongToPlaylist:', error);
    res.status(500).json({ message: 'Error adding song to playlist', error: error.message });
  }
};

export const updateSongInPlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { playlistId } = req.params;
    const { songId } = req.params;
    const updates = req.body;

    const userId = req.user?._id;
    
    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find playlist and update the specific song
    console.log('Updating song in playlist:', songId);
    const playlist = await Playlist.findOneAndUpdate(
      { 
        _id: playlistId, 
        user: userId,
        'songs.spotifyId': songId 
      },
      { 
        $set: {
          'songs.$.title': updates.title,
          'songs.$.artist': updates.artist
        }
      },
      { new: true }
    );

    if (!playlist) {
      console.error('Playlist or song not found:', playlistId, songId);
      return res.status(404).json({ message: 'Playlist or song not found' });
    }

    console.log('Song updated in playlist:', playlist);
    res.json(playlist);
  } catch (error) {
    console.error('Error in updateSongInPlaylist:', error);
    res.status(500).json({ message: 'Error updating song in playlist', error: error.message });
  }
};

export const deleteSongFromPlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { playlistId, songId } = req.params;

    const userId = req.user?._id;
    
    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find playlist and remove the song
    console.log('Deleting song from playlist:', songId);
    const playlist = await Playlist.findOneAndUpdate(
      { _id: playlistId, user: userId },
      { $pull: { songs: { spotifyId: songId } } },
      { new: true }
    );

    if (!playlist) {
      console.error('Playlist not found:', playlistId);
      return res.status(404).json({ message: 'Playlist not found' });
    }

    console.log('Song deleted from playlist:', playlist);
    res.json(playlist);
  } catch (error) {
    console.error('Error in deleteSongFromPlaylist:', error);
    res.status(500).json({ message: 'Error deleting song from playlist', error: error.message });
  }
};

export const getPlaylistById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user?._id;
    
    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('Fetching playlist by ID:', playlistId);
    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!playlist) {
      console.error('Playlist not found:', playlistId);
      return res.status(404).json({ message: 'Playlist not found' });
    }

    console.log('Found playlist:', playlist);
    res.json(playlist);
  } catch (error) {
    console.error('Error in getPlaylistById:', error);
    res.status(500).json({ message: 'Error getting playlist', error: error.message });
  }
};
