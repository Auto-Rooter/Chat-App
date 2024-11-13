import express from 'express';
import { login, refreshAccessToken, logout } from '../controllers/auth.controller';
import { authenticateRefreshToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/login', login);
router.post('/refresh', authenticateRefreshToken, refreshAccessToken);
router.post('/logout', logout);

export default router;