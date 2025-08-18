import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { createSupportRequest, getSupportRequests, getAllSupportRequests, assignSupportRequest, getAssignedRequests } from '../controllers/requestController.js';
import { requirePermission } from '../middlewares/requirePermission.js';

const router = express.Router();

//Δημιουργία αιτήματος υποστήριξης
router.post('/', 
    verifyToken, 
    requirePermission(['create_requests']),
    createSupportRequest);
   
//Προβολή προσωπικών αιτημάτων υποστήριξης
router.get('/', 
    verifyToken, 
    requirePermission(['view_own_requests']),
    getSupportRequests);

//Προβολή όλων των αιτημάτων υποστήριξης
// Επιτρέπει πρόσβαση μόνο σε υπάλληλους και admins
router.get('/all-requests', 
    verifyToken,
    requirePermission(['view_all_requests']),
    getAllSupportRequests);

//Ανάθεση αιτήματος
router.patch('/:id/assign', 
    verifyToken, 
    requirePermission(['assign_requests']), 
    assignSupportRequest);

//Προβολή ανατεθειμένων αιτημάτων
router.get('/assigned-to-me',
  verifyToken,
  requirePermission(['view_assigned_requests']),
  getAssignedRequests);


export default router;
