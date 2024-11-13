import express from 'express';
import {getMessages, addMessage} from '../controllers/message.controller';
import {authenticateJWT} from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/messages', authenticateJWT, getMessages);
router.post('/message', authenticateJWT, addMessage);

export default router;

