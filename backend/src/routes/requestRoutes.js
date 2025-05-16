import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { createSupportRequest, getSupportRequests, getAllSupportRequests, assignSupportRequest } from '../controllers/requestController.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();
//Δημιουργία αιτήματος υποστήριξης
router.post('/', verifyToken, createSupportRequest);    
//Προβολή αιτημάτων υποστήριξης
router.get('/', verifyToken, getSupportRequests);
//Προβολή όλων των αιτημάτων υποστήριξης
// Επιτρέπει πρόσβαση μόνο σε υπάλληλους και admins
router.get('/all-requests', verifyToken, getAllSupportRequests);
//Ανάθεση αιτήματος
router.patch('/:id/assign', verifyToken, assignSupportRequest);

export default router;
