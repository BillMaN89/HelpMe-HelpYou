import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { createSupportRequest } from '../controllers/requestController.js';

const router = express.Router();

router.post('/', verifyToken, createSupportRequest);

export default router;
