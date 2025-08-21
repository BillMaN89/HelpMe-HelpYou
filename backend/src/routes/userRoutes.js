import express from 'express';
import { getUserProfile, getUserByEmail, updateUserProfile } from '../controllers/userController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();
//Προβολή προφιλ
router.get( '/me', verifyToken, getUserProfile);
//Προβολή όλων των χρηστών
router.get ('/:email', verifyToken, getUserByEmail);
//Ενημέρωση προφιλ χρήστη
router.patch('/me', verifyToken, updateUserProfile);

export default router;
