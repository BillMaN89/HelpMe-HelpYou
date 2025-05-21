import express from 'express';
import { getUserProfile, getUserByEmail } from '../controllers/userController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();
//Προβολή προφιλ
router.get( '/me', verifyToken, getUserProfile);
//Προβολή όλων των χρηστών
router.get ('/:email', verifyToken, getUserByEmail);

export default router;
