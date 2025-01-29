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

interface AuthenticatedRequest extends Request {
  user?: {
    spotifyAccessToken: string;
  };
}

const router = express.Router();

// Protected routes (require authentication)
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    await createPlaylist(req, res);
});

router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    await getUserPlaylists(req, res);
});

router.get('/:playlistId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    await getPlaylistById(req, res);
});

router.put('/:playlistId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    await updatePlaylist(req, res);
});

router.delete('/:playlistId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    await deletePlaylist(req, res);
});

// Song management routes
router.post('/:playlistId/songs', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    await addSongToPlaylist(req, res);
});

router.put('/:playlistId/songs/:songId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    await updateSongInPlaylist(req, res);
});

router.delete('/:playlistId/songs/:songId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    await deleteSongFromPlaylist(req, res);
});

export default router;
