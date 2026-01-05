import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { requirePermission } from '../middlewares/requirePermission.js';
import {
  getNotes,
  addNote,
  editNote,
  deleteNote,
} from '../controllers/noteController.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get notes for a request - viewers can access
router.get('/:requestType/:requestId',
  requirePermission(['view_requests', 'view_anonymous_requests', 'manage_anonymous_requests']),
  getNotes
);

// Add a note - only employees with edit permission (not viewers)
router.post('/:requestType/:requestId',
  requirePermission(['edit_req_status', 'manage_anonymous_requests']),
  addNote
);

// Edit a note - controller checks author ownership
router.patch('/:noteId',
  verifyToken,
  editNote
);

// Delete a note - controller checks admin role
router.delete('/:noteId',
  verifyToken,
  deleteNote
);

export default router;
