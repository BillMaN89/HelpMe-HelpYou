import { pool } from '../db/pool.js';

export function requireRole(requiredRoles) {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return async (req, res, next) => {
    const { email } = req.user;

    if (!email) {
      return res.status(401).json({ message: 'Δεν εντοπίστηκε χρήστης' });
    }

    try {
      const result = await pool.query(
        'SELECT role_name FROM user_roles WHERE email = $1',
        [email]
      );
      const userRoles = result.rows.map(r => r.role_name);

      if (!roles.some(role => userRoles.includes(role))) {
        return res.status(403).json({ message: 'Απαγορεύεται η πρόσβαση' });
      }

      next();
    } catch (error) {
      console.error('Σφάλμα στον έλεγχο ρόλου:', error);
      res.status(500).json({ message: 'Σφάλμα κατά τον έλεγχο πρόσβασης' });
    }
  };
}
