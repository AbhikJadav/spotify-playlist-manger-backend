import express from 'express';
import { 
  createPlaylist, 
  getUserPlaylists, 
  updatePlaylist, 
  deletePlaylist,
  addSongToPlaylist,
  updateSongInPlaylist,
  deleteSongFromPlaylist,
  getPlaylistById
} from '../controllers/playlistController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes (require authentication)
router.post('/', authMiddleware, createPlaylist);
router.get('/', authMiddleware, getUserPlaylists);
router.get('/:playlistId', authMiddleware, getPlaylistById);
router.put('/:playlistId', authMiddleware, updatePlaylist);
router.delete('/:playlistId', authMiddleware, deletePlaylist);

// Song management routes
router.post('/:playlistId/songs', authMiddleware, addSongToPlaylist);
router.put('/:playlistId/songs/:songId', authMiddleware, updateSongInPlaylist);
router.delete('/:playlistId/songs/:songId', authMiddleware, deleteSongFromPlaylist);

export default router;
