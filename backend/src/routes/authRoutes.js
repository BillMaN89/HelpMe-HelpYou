import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/verifyToken.js';


const router = express.Router();

// Route για εγγραφή χρήστη 
router.post('/register', registerUser);
// Route για login χρήστη
router.post('/login', loginUser);

// Route για αυθεντικοποίηση χρήστη
router.get('/me', verifyToken, (req,res) => {
    res.status(200).json({
        message: 'Η αυθεντικοποίηση του χρήστη έγινε επιτυχώς',
        user: req.user
    });
});




export default router;