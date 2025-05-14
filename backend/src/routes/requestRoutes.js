import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { createSupportRequest, getSupportRequests } from '../controllers/requestController.js';

const router = express.Router();

router.post('/', verifyToken, createSupportRequest);
router.get('/', verifyToken, getSupportRequests);
export default router;
