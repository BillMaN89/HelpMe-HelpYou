import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/verifyToken.js';


const router = express.Router();

//register route
router.post('/register', registerUser);
//login route
router.post('/login', loginUser);

export default router;