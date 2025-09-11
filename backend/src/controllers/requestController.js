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

export async function getSupportRequests(req, res) {
  const { email } = req.user;
  
  try {
    //Προβολή αιτημάτων υποστήριξης
    const result = await pool.query(
      'SELECT * FROM support_requests WHERE user_email = $1 ORDER BY created_at ASC',
      [email]
    );

    res.status(200).json({ requests: result.rows });
  } catch (error) {
    console.error('Σφάλμα κατά την προβολή αιτημάτων:', error);
    res.status(500).json({ message: 'Σφάλμα κατά την προβολή αιτημάτων' });
  }
}


export async function getAllSupportRequests(req, res) {
  const { email } = req.user;

  try {
    // Πάρε τα permissions
    const permResult = await pool.query(
      `SELECT rp.permission_name
         FROM role_permissions AS rp
         JOIN user_roles AS ur ON ur.role_name = rp.role_name
        WHERE ur.email = $1`,
      [email]
    );
    const permissions = permResult.rows.map(r => r.permission_name);
    console.log(`Permissions for ${email}:`, permissions);

    // Πάρε τους ρόλους
    const rolesResult = await pool.query(
      `SELECT role_name
         FROM user_roles
        WHERE email = $1`,
      [email]
    );
    const roles = rolesResult.rows.map(r => r.role_name);
    console.log(`Roles for ${email}:`, roles);

    // === Admin -> όλα
    if (roles.includes('admin')) {
      console.log('User is admin — returning all requests');
      const all = await pool.query(
        'SELECT * FROM support_requests ORDER BY created_at ASC'
      );
      return res.status(200).json({ requests: all.rows });
    }

    // === Therapist -> μόνο psychological
    if (roles.includes('therapist')) {
      console.log('User is therapist — returning psychological requests');
      const result = await pool.query(
        `SELECT * FROM support_requests
         WHERE service_type = 'psychological'
         ORDER BY created_at ASC`
      );
      return res.status(200).json({ requests: result.rows });
    }

    // === Social Worker -> μόνο social
    if (roles.includes('social_worker')) {
      console.log('User is social_worker — returning social requests');
      const result = await pool.query(
        `SELECT * FROM support_requests
         WHERE service_type = 'social'
         ORDER BY created_at ASC`
      );
      return res.status(200).json({ requests: result.rows });
    }

    // === Assigned requests μόνο
    if (permissions.includes('view_assigned_requests')) {
      console.log('User has view_assigned_requests permission — returning assigned requests');
      const assigned = await pool.query(
        `SELECT * FROM support_requests
         WHERE assigned_employee_email = $1
         ORDER BY created_at ASC`,
        [email]
      );
      return res.status(200).json({ requests: assigned.rows });
    }

    // === Δεν έχει δικαίωμα
    console.warn(`Access denied for ${email} — no matching role/permission`);
    return res.status(403).json({
      message: 'Δεν έχετε δικαίωμα πρόσβασης σε αιτήματα'
    });

  } catch (error) {
    console.error('Σφάλμα κατά την προβολή αιτημάτων:', error);
    return res.status(500).json({
      message: 'Σφάλμα κατά την προβολή αιτημάτων'
    });
  }
}

export async function assignSupportRequest(req, res) {
  const { id } = req.params;
  const { assigned_employee_email } = req.body;

  if (!assigned_employee_email) {
    return res.status(400).json({ message: 'Λείπει το email του υπαλλήλου ή εθελοντή' });
  }

  try {
    // Βεβαιώσου ότι το request υπάρχει
    const requestCheck = await pool.query(
      'SELECT * FROM support_requests WHERE request_id = $1',
      [id]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Το αίτημα δεν βρέθηκε' });
    }

    // Βεβαιώσου ότι υπάρχει ο assigned χρήστης
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [assigned_employee_email]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Ο υπάλληλος/εθελοντής δεν βρέθηκε' });
    }

    // Update request με assigned user
    const updated = await pool.query(
      `UPDATE support_requests
         SET assigned_employee_email = $1,
             status = 'assigned',
             updated_at = CURRENT_TIMESTAMP
       WHERE request_id = $2
       RETURNING *`,
      [assigned_employee_email, id]
    );

    res.status(200).json({
      message: 'Το αίτημα ανατέθηκε με επιτυχία',
      request: updated.rows[0]
    });

  } catch (error) {
    console.error('Σφάλμα κατά την ανάθεση αιτήματος:', error);
    res.status(500).json({ message: 'Σφάλμα κατά την ανάθεση αιτήματος' });
  }
}


export async function getAssignedRequests(req, res) {
  const { email } = req.user;

  try {
    const { rows } = await pool.query(
      `SELECT *
         FROM support_requests
        WHERE assigned_employee_email = $1
        ORDER BY created_at ASC`, //παλιότερα πρώτα
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(200).json({
      message: 'Δεν υπάρχουν ανατεθειμένα αιτήματα για εσάς αυτή τη στιγμή',
      requests: []
      });
    }

    return res.status(200).json({ requests: rows });
    
  } catch (error) {
    console.error('Σφάλμα κατά την προβολή ανατεθειμένων αιτημάτων:', error);
    return res.status(500).json({
      message: 'Σφάλμα κατά την προβολή ανατεθειμένων αιτημάτων'
    });
  }
}

export async function updateSupportRequestStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = new Set(['assigned', 'in_progress', 'completed', 'cancelled', 'canceled']);
  if (!status || !allowed.has(String(status).toLowerCase())) {
    return res.status(400).json({ message: 'Μη έγκυρη κατάσταση αίτησης' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE support_requests
         SET status = $1,
             updated_at = CURRENT_TIMESTAMP
       WHERE request_id = $2
       RETURNING *`,
      [status, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Το αίτημα δεν βρέθηκε' });
    }

    return res.status(200).json({ message: 'Η κατάσταση ενημερώθηκε', request: rows[0] });
  } catch (error) {
    console.error('Σφάλμα κατά την ενημέρωση κατάστασης:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά την ενημέρωση κατάστασης' });
  }
}

export async function deleteSupportRequest(req, res) {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `DELETE FROM support_requests
        WHERE request_id = $1
        RETURNING *`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Το αίτημα δεν βρέθηκε' });
    }
    return res.status(200).json({ message: 'Το αίτημα διαγράφηκε' });
  } catch (error) {
    console.error('Σφάλμα κατά τη διαγραφή αιτήματος:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά τη διαγραφή αιτήματος' });
  }
}
