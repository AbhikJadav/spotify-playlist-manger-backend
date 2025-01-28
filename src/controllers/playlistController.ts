import { Request, Response } from 'express';
import Playlist from '../models/Playlist';
import User from '../models/User';

export const createPlaylist = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user._id;
    const { name, description, isPublic } = req.body;

    const newPlaylist = new Playlist({
      name,
      description,
      user: userId,
      isPublic: isPublic || false,
      songs: []
    });

    const playlist = await newPlaylist.save();

    // Update user's playlists
    await User.findByIdAndUpdate(userId, { 
      $push: { playlists: playlist._id } 
    });

    res.status(201).json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating playlist' });
  }
};

export const getUserPlaylists = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user._id;

    const playlists = await Playlist.find({ user: userId });
    res.json(playlists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching playlists' });
  }
};

export const updatePlaylist = async (req: Request, res: Response) => {
  try {
    const { playlistId } = req.params;
    const { name, description, isPublic } = req.body;

    // @ts-ignore
    const userId = req.user._id;

    const playlist = await Playlist.findOneAndUpdate(
      { _id: playlistId, user: userId },
      { name, description, isPublic },
      { new: true }
    );

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating playlist' });
  }
};

export const deletePlaylist = async (req: Request, res: Response) => {
  try {
    const { playlistId } = req.params;

    // @ts-ignore
    const userId = req.user._id;

    const playlist = await Playlist.findOneAndDelete({ 
      _id: playlistId, 
      user: userId 
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Remove playlist reference from user
    await User.findByIdAndUpdate(userId, { 
      $pull: { playlists: playlistId } 
    });

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting playlist' });
  }
};

export const addSongToPlaylist = async (req: Request, res: Response) => {
  try {
    const { playlistId } = req.params;
    const { song } = req.body;

    if (!song) {
      return res.status(400).json({ message: 'Song data is required' });
    }

    // @ts-ignore
    const userId = req.user._id;

    // Validate song data
    if (!song.spotifyId || !song.title || !song.artist || !song.album) {
      return res.status(400).json({ message: 'Invalid song data' });
    }

    // Find playlist and check if song exists
    const existingPlaylist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!existingPlaylist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const songExists = existingPlaylist.songs.some(s => s.spotifyId === song.spotifyId);
    if (songExists) {
      return res.status(400).json({ message: 'Song already exists in playlist' });
    }

    // Add song to playlist
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
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ message: 'Error adding song to playlist' });
  }
};

export const updateSongInPlaylist = async (req: Request, res: Response) => {
  try {
    const { playlistId } = req.params;
    const { songId } = req.params;
    const updates = req.body;

    // @ts-ignore
    const userId = req.user._id;

    // Find playlist and update the specific song
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
      return res.status(404).json({ message: 'Playlist or song not found' });
    }

    res.json(playlist);
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ message: 'Error updating song in playlist' });
  }
};

export const deleteSongFromPlaylist = async (req: Request, res: Response) => {
  try {
    const { playlistId, songId } = req.params;

    // @ts-ignore
    const userId = req.user._id;

    // Find playlist and remove the song
    const playlist = await Playlist.findOneAndUpdate(
      { _id: playlistId, user: userId },
      { $pull: { songs: { spotifyId: songId } } },
      { new: true }
    );

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json(playlist);
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ message: 'Error deleting song from playlist' });
  }
};

export const getPlaylistById = async (req: Request, res: Response) => {
  try {
    const { playlistId } = req.params;
    // @ts-ignore
    const userId = req.user._id;

    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json(playlist);
  } catch (error) {
    console.error('Error getting playlist:', error);
    res.status(500).json({ message: 'Error getting playlist' });
  }
};
