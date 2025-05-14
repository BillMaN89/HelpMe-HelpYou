import { pool } from '../db/pool.js';

export async function createSupportRequest(req, res) {
    const { service_type, description } = req.body;
  
    if (!service_type || !description) {
      return res.status(400).json({ message: 'Λείπουν υποχρεωτικά πεδία' });
    }
  
    try {
      const newRequest = await pool.query(
        `INSERT INTO support_requests (
          user_email, service_type, description
        ) VALUES ($1, $2, $3) RETURNING *`,
        [req.user.email, service_type, description]
      );
  
      res.status(201).json({
        message: 'Η αίτηση υποστήριξης δημιουργήθηκε επιτυχώς',
        request: newRequest.rows[0]
      });
    } catch (error) {
      console.error('Σφάλμα κατά την δημιουργία αίτησης υποστήριξης:', error);
      res.status(500).json({ message: 'Σφάλμα κατά την δημιουργία αίτησης υποστήριξης' });
    }
  }
  