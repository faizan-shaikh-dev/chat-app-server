import express from 'express';
import { deleteForEveryOne, deleteForMe, getMessage, sendMessage } from '../controllers/message.Controller.js';

const router = express.Router();

router.post('/send/:chatId', sendMessage);

router.get('/:chatId', getMessage);

router.delete('/:messageId', deleteForMe);

router.delete('/everyone/:messageId', deleteForEveryOne)

export default router;