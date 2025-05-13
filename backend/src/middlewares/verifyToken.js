import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { pool } from '../db/pool.js';

export const verifyToken = (req, res, next) => {
    // Έλεγχος αν το token υπάρχει στο header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Δεν δόθηκε token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ message: 'Token δεν είναι έγκυρο' });
  }
};
