import express from 'express';
import { logout, refreshToken, userLogin, userRegister } from '../controllers/auth.Controller.js';

const router = express.Router();

router.post('/login', userLogin);
router.post('/register', userRegister);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;