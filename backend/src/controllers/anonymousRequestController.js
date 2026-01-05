import { pool } from '../db/pool.js';
import { ensureInteger } from '../utils/helpers.js';

export async function createAnonymousRequest(req, res) {
  const { full_name, email, mobile, service_type, description, assigned_employee_email } = req.body;
  const created_by_email = req.user.email;

  if (!full_name || !mobile || !service_type || !description) {
    return res.status(400).json({ message: 'Λείπουν υποχρεωτικά πεδία' });
  }

  const allowedServiceTypes = ['social', 'psychological'];
  if (!allowedServiceTypes.includes(service_type)) {
    return res.status(400).json({ message: 'Μη έγκυρος τύπος υπηρεσίας' });
  }

  try {
    // If assigned_employee_email is provided, verify employee exists
    if (assigned_employee_email) {
      const userCheck = await pool.query(
        'SELECT email FROM users WHERE email = $1',
        [assigned_employee_email]
      );
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Ο υπάλληλος δεν βρέθηκε' });
      }
    }

    const status = assigned_employee_email ? 'assigned' : 'unassigned';

    const { rows } = await pool.query(
      `INSERT INTO anonymous_requests (
        full_name, email, mobile, service_type, description,
        assigned_employee_email, status, created_by_email
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [full_name, email || null, mobile, service_type, description, assigned_employee_email || null, status, created_by_email]
    );

    res.status(201).json({
      message: 'Το ανώνυμο αίτημα δημιουργήθηκε επιτυχώς',
      request: rows[0]
    });
  } catch (error) {
    console.error('Σφάλμα κατά τη δημιουργία ανώνυμου αιτήματος:', error);
    res.status(500).json({ message: 'Σφάλμα κατά τη δημιουργία ανώνυμου αιτήματος' });
  }
}

export async function getAllAnonymousRequests(req, res) {
  try {
    const pageParam = ensureInteger(req.query?.page);
    const sizeParam = ensureInteger(req.query?.pageSize ?? req.query?.limit);
    const statusFilter = (req.query?.status || '').trim().toLowerCase();

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const pageSizeRaw = Number.isFinite(sizeParam) && sizeParam > 0 ? sizeParam : 20;
    const pageSize = Math.min(pageSizeRaw, 100);
    const offset = (page - 1) * pageSize;

    const allowedStatuses = new Set(['unassigned', 'assigned', 'in_progress', 'completed', 'canceled']);
    const applyStatus = statusFilter && statusFilter !== 'all' && allowedStatuses.has(statusFilter);

    const params = applyStatus ? [statusFilter, pageSize, offset] : [pageSize, offset];
    const whereClause = applyStatus ? 'WHERE ar.status = $1' : '';
    const limitIdx = applyStatus ? 2 : 1;
    const offsetIdx = applyStatus ? 3 : 2;

    const query = `
      SELECT ar.*,
             u.first_name AS assigned_employee_first_name,
             u.last_name AS assigned_employee_last_name,
             c.first_name AS created_by_first_name,
             c.last_name AS created_by_last_name,
             COUNT(*) OVER() AS total_count
        FROM anonymous_requests AS ar
        LEFT JOIN users AS u ON ar.assigned_employee_email = u.email
        LEFT JOIN users AS c ON ar.created_by_email = c.email
        ${whereClause}
       ORDER BY ar.created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const result = await pool.query(query, params);

    let total = result.rows[0]?.total_count ?? 0;
    if (result.rows.length === 0 && offset > 0) {
      const countQuery = `SELECT COUNT(*) AS total FROM anonymous_requests AS ar ${whereClause}`;
      const countParams = applyStatus ? [statusFilter] : [];
      const countRes = await pool.query(countQuery, countParams);
      total = Number(countRes.rows[0]?.total ?? 0);
    }

    const requests = result.rows.map(({ total_count, ...rest }) => rest);
    const totalPages = pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1;

    res.status(200).json({
      requests,
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Σφάλμα κατά την προβολή ανώνυμων αιτημάτων:', error);
    res.status(500).json({ message: 'Σφάλμα κατά την προβολή ανώνυμων αιτημάτων' });
  }
}

export async function getAnonymousRequestById(req, res) {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT ar.*,
              u.first_name AS assigned_employee_first_name,
              u.last_name AS assigned_employee_last_name,
              c.first_name AS created_by_first_name,
              c.last_name AS created_by_last_name
         FROM anonymous_requests AS ar
         LEFT JOIN users AS u ON ar.assigned_employee_email = u.email
         LEFT JOIN users AS c ON ar.created_by_email = c.email
        WHERE ar.request_id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Το αίτημα δεν βρέθηκε' });
    }

    return res.status(200).json({ request: rows[0] });
  } catch (error) {
    console.error('Σφάλμα κατά την ανάκτηση ανώνυμου αιτήματος:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά την ανάκτηση ανώνυμου αιτήματος' });
  }
}

export async function assignAnonymousRequest(req, res) {
  const { id } = req.params;
  const { assigned_employee_email } = req.body;

  if (!assigned_employee_email) {
    return res.status(400).json({ message: 'Λείπει το email του υπαλλήλου' });
  }

  try {
    // Check request exists
    const requestCheck = await pool.query(
      'SELECT * FROM anonymous_requests WHERE request_id = $1',
      [id]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Το αίτημα δεν βρέθηκε' });
    }

    // Check employee exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [assigned_employee_email]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Ο υπάλληλος δεν βρέθηκε' });
    }

    const { rows } = await pool.query(
      `UPDATE anonymous_requests
         SET assigned_employee_email = $1,
             status = 'assigned',
             updated_at = CURRENT_TIMESTAMP
       WHERE request_id = $2
       RETURNING *`,
      [assigned_employee_email, id]
    );

    res.status(200).json({
      message: 'Το αίτημα ανατέθηκε με επιτυχία',
      request: rows[0]
    });
  } catch (error) {
    console.error('Σφάλμα κατά την ανάθεση ανώνυμου αιτήματος:', error);
    res.status(500).json({ message: 'Σφάλμα κατά την ανάθεση ανώνυμου αιτήματος' });
  }
}

export async function updateAnonymousRequestStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = new Set(['assigned', 'in_progress', 'completed', 'cancelled', 'canceled']);
  if (!status || !allowed.has(String(status).toLowerCase())) {
    return res.status(400).json({ message: 'Μη έγκυρη κατάσταση αίτησης' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE anonymous_requests
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

export async function updateAnonymousRequestNotes(req, res) {
  const { id } = req.params;
  const { notes_from_employee } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE anonymous_requests
         SET notes_from_employee = $1,
             updated_at = CURRENT_TIMESTAMP
       WHERE request_id = $2
       RETURNING *`,
      [notes_from_employee, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Το αίτημα δεν βρέθηκε' });
    }

    return res.status(200).json({ message: 'Οι σημειώσεις ενημερώθηκαν', request: rows[0] });
  } catch (error) {
    console.error('Σφάλμα κατά την ενημέρωση σημειώσεων:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά την ενημέρωση σημειώσεων' });
  }
}

export async function deleteAnonymousRequest(req, res) {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `DELETE FROM anonymous_requests
        WHERE request_id = $1
        RETURNING *`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Το αίτημα δεν βρέθηκε' });
    }

    return res.status(200).json({ message: 'Το αίτημα διαγράφηκε' });
  } catch (error) {
    console.error('Σφάλμα κατά τη διαγραφή ανώνυμου αιτήματος:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά τη διαγραφή ανώνυμου αιτήματος' });
  }
}
