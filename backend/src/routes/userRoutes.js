import express from 'express';
import { getUserProfile, getUserByEmail, updateUser, deleteUserProfile } from '../controllers/userController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();
router.use(verifyToken)
//Προβολή προφιλ
router.get( '/me', getUserProfile);

//Ενημέρωση προφιλ χρήστη
router.patch('/me', updateUser);

//Προβολή όλων των χρηστών
router.get ('/:email', getUserByEmail);

//Διαγραφή χρήστη
router.delete('/:email', deleteUserProfile);

export default router;
