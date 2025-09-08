import { pool } from '../db/pool.js';

export function requirePermission(requiredPermissions) {
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

  return async (req, res, next) => {
    const { email } = req.user;

    if (!email) {
      return res.status(401).json({ message: 'Δεν εντοπίστηκε χρήστης' });
    }

    try {
        //Πάρε τα permissions
      const result = await pool.query(
        `SELECT rp.permission_name
           FROM role_permissions AS rp
           JOIN user_roles AS ur ON rp.role_name = ur.role_name
          WHERE ur.email = $1`,
        [email]
      );
      
      const userPermissions = result.rows.map(r => r.permission_name);
      //Έλεγχος αν ο χρήστης έχει το δικαίωμα ανάθεσης αιτημάτων
      const hasPermission = permissions.some(p => userPermissions.includes(p));

      if (!hasPermission) {
        return res.status(403).json({ message: 'Απαγορεύεται η πρόσβαση (permissions)' });
      }

      next();
    } catch (error) {
      console.error('Σφάλμα στον έλεγχο permission:', error);
      res.status(500).json({ message: 'Σφάλμα κατά τον έλεγχο δικαιωμάτων' });
    }
  };
}
