import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/verifyToken.js';


const router = express.Router();

// Route για εγγραφή χρήστη 
router.post('/register', registerUser);
// Route για login χρήστη
router.post('/login', loginUser);





export default router;