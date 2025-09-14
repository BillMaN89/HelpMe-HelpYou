import express from 'express';
import { getUserProfile, getUserByEmail, updateUser, deleteUserProfile, listUsers, listRoles, setUserRoles } from '../controllers/userController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();
router.use(verifyToken)

//Λίστα χρηστών (με permissions)
router.get('/', listUsers);

//Λίστα ρόλων (admin-only)
router.get('/roles', listRoles);

//Προβολή προφιλ
router.get( '/me', getUserProfile);

//Ενημέρωση προφιλ χρήστη
router.patch('/me', updateUser);

//Προβολή χρήστη με email
router.get ('/:email', getUserByEmail);

//Ενημέρωση ρόλων χρήστη (admin-only)
router.patch('/:email/roles', setUserRoles);

//Διαγραφή χρήστη
router.delete('/:email', deleteUserProfile);

export default router;
