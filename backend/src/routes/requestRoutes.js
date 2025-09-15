import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { createSupportRequest, getSupportRequests, getAllSupportRequests, assignSupportRequest, getAssignedRequests, updateSupportRequestStatus, deleteSupportRequest, getSupportRequestById } from '../controllers/requestController.js';
import { requirePermission } from '../middlewares/requirePermission.js';

const router = express.Router();
router.use(verifyToken);

//Δημιουργία αιτήματος υποστήριξης
router.post('/', 
    requirePermission(['create_request']),
    createSupportRequest);
   
//Προβολή προσωπικών αιτημάτων υποστήριξης
router.get('/', 
    requirePermission(['view_own_requests']),
    getSupportRequests);

//Προβολή όλων των αιτημάτων υποστήριξης
// Επιτρέπει πρόσβαση μόνο σε υπάλληλους και admins
router.get('/all-requests', 
    requirePermission(['view_requests']),
    getAllSupportRequests);

//Ανάθεση αιτήματος
router.patch('/:id/assign', 
    requirePermission(['assign_requests']), 
    assignSupportRequest);

//Προβολή ανατεθειμένων αιτημάτων
router.get('/assigned-to-me',
  requirePermission(['view_assigned_requests']),
  getAssignedRequests);

// Προβολή ενός αιτήματος (staff/admin)
router.get('/:id',
  requirePermission(['view_requests']),
  getSupportRequestById);

// Ενημέρωση κατάστασης αιτήματος
router.patch('/:id/status',
  requirePermission(['edit_req_status']),
  updateSupportRequestStatus);

// Διαγραφή αιτήματος
router.delete('/:id',
  requirePermission(['assign_requests']),
  deleteSupportRequest);


export default router;
