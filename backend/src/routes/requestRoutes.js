import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { createSupportRequest, getSupportRequests, getAllSupportRequests, assignSupportRequest, getAssignedRequests, updateSupportRequestStatus, deleteSupportRequest, getSupportRequestById, getUnassignedRequests } from '../controllers/requestController.js';
import { requirePermission } from '../middlewares/requirePermission.js';

const router = express.Router();
router.use(verifyToken);

//create support request
router.post('/', 
    requirePermission(['create_request']),
    createSupportRequest);
   
//view personal requests
router.get('/', 
    requirePermission(['view_own_requests']),
    getSupportRequests);

//view all requests
router.get('/all-requests', 
    requirePermission(['view_requests']),
    getAllSupportRequests);

//assign request
router.patch('/:id/assign', 
    requirePermission(['assign_requests']), 
    assignSupportRequest);

//view assigned requests
router.get('/assigned-to-me',
  requirePermission(['view_assigned_requests']),
  getAssignedRequests);

router.get('/unassigned',
  requirePermission(['assign_requests']),
  getUnassignedRequests);

// view request (staff/admin)
router.get('/:id',
  requirePermission(['view_requests']),
  getSupportRequestById);

// update request status
router.patch('/:id/status',
  requirePermission(['edit_req_status']),
  updateSupportRequestStatus);

// delete request
router.delete('/:id',
  requirePermission(['assign_requests']),
  deleteSupportRequest);


export default router;
