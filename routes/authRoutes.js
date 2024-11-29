import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser);
router.post('/verify-email', authController.verifyEmail);

export default router;
