import express from 'express';
import { getUserProfile, getUserByEmail, updateUser, deleteUserProfile, listUsers, listRoles, setUserRoles } from '../controllers/userController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();
router.use(verifyToken)

//User list (permission based)
router.get('/', listUsers);

//Roles list (admin-only)
router.get('/roles', listRoles);

//View profile
router.get( '/me', getUserProfile);

//Update user profile
router.patch('/me', updateUser);

//View user by email
router.get ('/:email', getUserByEmail);

//Update user roles (admin-only)
router.patch('/:email/roles', setUserRoles);

//Delete user
router.delete('/:email', deleteUserProfile);

export default router;
