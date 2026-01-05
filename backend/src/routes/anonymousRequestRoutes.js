import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { requirePermission } from '../middlewares/requirePermission.js';
import {
  createAnonymousRequest,
  getAllAnonymousRequests,
  getAnonymousRequestById,
  assignAnonymousRequest,
  updateAnonymousRequestStatus,
  updateAnonymousRequestNotes,
  deleteAnonymousRequest,
} from '../controllers/anonymousRequestController.js';

const router = express.Router();
router.use(verifyToken);

// Create anonymous request
router.post('/',
  requirePermission(['manage_anonymous_requests']),
  createAnonymousRequest);

// Get all anonymous requests (paginated) - viewers can also access
router.get('/',
  requirePermission(['manage_anonymous_requests', 'view_anonymous_requests']),
  getAllAnonymousRequests);

// Get single anonymous request by ID - viewers can also access
router.get('/:id',
  requirePermission(['manage_anonymous_requests', 'view_anonymous_requests']),
  getAnonymousRequestById);

// Assign anonymous request
router.patch('/:id/assign',
  requirePermission(['manage_anonymous_requests']),
  assignAnonymousRequest);

// Update anonymous request status
router.patch('/:id/status',
  requirePermission(['manage_anonymous_requests']),
  updateAnonymousRequestStatus);

// Update anonymous request notes
router.patch('/:id/notes',
  requirePermission(['manage_anonymous_requests']),
  updateAnonymousRequestNotes);

// Delete anonymous request
router.delete('/:id',
  requirePermission(['manage_anonymous_requests']),
  deleteAnonymousRequest);

export default router;
