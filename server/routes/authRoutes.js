import express from 'express';
import { register, login, me, updateProfile } from '../controllers/authController.js';
import { verifyJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyJWT, me);
router.put('/profile', verifyJWT, updateProfile);

export default router;
