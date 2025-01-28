import express, { Request, Response } from 'express';
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
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    return await createPlaylist(req, res);
});

router.get('/', authMiddleware, async (req: Request, res: Response) => {
    return await getUserPlaylists(req, res);
});

router.get('/:playlistId', authMiddleware, async (req: Request, res: Response) => {
    return await getPlaylistById(req, res);
});

router.put('/:playlistId', authMiddleware, async (req: Request, res: Response) => {
    return await updatePlaylist(req, res);
});

router.delete('/:playlistId', authMiddleware, async (req: Request, res: Response) => {
    return await deletePlaylist(req, res);
});

// Song management routes
router.post('/:playlistId/songs', authMiddleware, async (req: Request, res: Response) => {
    return await addSongToPlaylist(req, res);
});

router.put('/:playlistId/songs/:songId', authMiddleware, async (req: Request, res: Response) => {
    return await updateSongInPlaylist(req, res);
});

router.delete('/:playlistId/songs/:songId', authMiddleware, async (req: Request, res: Response) => {
    return await deleteSongFromPlaylist(req, res);
});

export default router;
