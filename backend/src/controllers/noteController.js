import { pool } from '../db/pool.js';

// Get all notes for a request
export async function getNotes(req, res) {
  const { requestType, requestId } = req.params;

  // Validate request type
  if (!['support', 'anonymous'].includes(requestType)) {
    return res.status(400).json({ message: 'Μη έγκυρος τύπος αιτήματος' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT
         n.note_id,
         n.content,
         n.author_email,
         u.first_name AS author_first_name,
         u.last_name AS author_last_name,
         n.created_at,
         n.updated_at
       FROM request_notes n
       LEFT JOIN users u ON u.email = n.author_email
       WHERE n.request_type = $1 AND n.request_id = $2
       ORDER BY n.created_at ASC`,
      [requestType, requestId]
    );

    return res.status(200).json({ notes: rows });
  } catch (error) {
    console.error('Σφάλμα στο getNotes:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά την ανάκτηση σημειώσεων' });
  }
}

// Add a new note
export async function addNote(req, res) {
  const { requestType, requestId } = req.params;
  const { content } = req.body;
  const authorEmail = req.user?.email;

  // Validate request type
  if (!['support', 'anonymous'].includes(requestType)) {
    return res.status(400).json({ message: 'Μη έγκυρος τύπος αιτήματος' });
  }

  if (!content?.trim()) {
    return res.status(400).json({ message: 'Το περιεχόμενο της σημείωσης είναι υποχρεωτικό' });
  }

  if (!authorEmail) {
    return res.status(401).json({ message: 'Μη εξουσιοδοτημένο αίτημα' });
  }

  try {
    // Verify the request exists
    const tableName = requestType === 'support' ? 'support_requests' : 'anonymous_requests';
    const { rows: reqRows } = await pool.query(
      `SELECT request_id FROM ${tableName} WHERE request_id = $1`,
      [requestId]
    );

    if (reqRows.length === 0) {
      return res.status(404).json({ message: 'Το αίτημα δεν βρέθηκε' });
    }

    // Insert the note
    const { rows } = await pool.query(
      `INSERT INTO request_notes (request_type, request_id, author_email, content)
       VALUES ($1, $2, $3, $4)
       RETURNING note_id, content, author_email, created_at, updated_at`,
      [requestType, requestId, authorEmail, content.trim()]
    );

    // Get author info
    const { rows: userRows } = await pool.query(
      `SELECT first_name, last_name FROM users WHERE email = $1`,
      [authorEmail]
    );

    const note = {
      ...rows[0],
      author_first_name: userRows[0]?.first_name || null,
      author_last_name: userRows[0]?.last_name || null,
    };

    return res.status(201).json({ note });
  } catch (error) {
    console.error('Σφάλμα στο addNote:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά την προσθήκη σημείωσης' });
  }
}

// Edit a note (author only)
export async function editNote(req, res) {
  const { noteId } = req.params;
  const { content } = req.body;
  const userEmail = req.user?.email;

  if (!content?.trim()) {
    return res.status(400).json({ message: 'Το περιεχόμενο της σημείωσης είναι υποχρεωτικό' });
  }

  if (!userEmail) {
    return res.status(401).json({ message: 'Μη εξουσιοδοτημένο αίτημα' });
  }

  try {
    // Check if note exists and user is the author
    const { rows: noteRows } = await pool.query(
      `SELECT note_id, author_email FROM request_notes WHERE note_id = $1`,
      [noteId]
    );

    if (noteRows.length === 0) {
      return res.status(404).json({ message: 'Η σημείωση δεν βρέθηκε' });
    }

    if (noteRows[0].author_email !== userEmail) {
      return res.status(403).json({ message: 'Μπορείτε να επεξεργαστείτε μόνο τις δικές σας σημειώσεις' });
    }

    // Update the note
    const { rows } = await pool.query(
      `UPDATE request_notes
       SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE note_id = $2
       RETURNING note_id, content, author_email, created_at, updated_at`,
      [content.trim(), noteId]
    );

    // Get author info
    const { rows: userRows } = await pool.query(
      `SELECT first_name, last_name FROM users WHERE email = $1`,
      [userEmail]
    );

    const note = {
      ...rows[0],
      author_first_name: userRows[0]?.first_name || null,
      author_last_name: userRows[0]?.last_name || null,
    };

    return res.status(200).json({ note });
  } catch (error) {
    console.error('Σφάλμα στο editNote:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά την επεξεργασία σημείωσης' });
  }
}

// Delete a note (admin only)
export async function deleteNote(req, res) {
  const { noteId } = req.params;
  const userEmail = req.user?.email;

  if (!userEmail) {
    return res.status(401).json({ message: 'Μη εξουσιοδοτημένο αίτημα' });
  }

  try {
    // Check if user is admin
    const { rows: roleRows } = await pool.query(
      `SELECT 1 FROM user_roles WHERE email = $1 AND role_name = 'admin'`,
      [userEmail]
    );

    if (roleRows.length === 0) {
      return res.status(403).json({ message: 'Μόνο οι διαχειριστές μπορούν να διαγράψουν σημειώσεις' });
    }

    // Check if note exists
    const { rows: noteRows } = await pool.query(
      `SELECT note_id FROM request_notes WHERE note_id = $1`,
      [noteId]
    );

    if (noteRows.length === 0) {
      return res.status(404).json({ message: 'Η σημείωση δεν βρέθηκε' });
    }

    // Delete the note
    await pool.query(`DELETE FROM request_notes WHERE note_id = $1`, [noteId]);

    return res.status(200).json({ message: 'Η σημείωση διαγράφηκε επιτυχώς' });
  } catch (error) {
    console.error('Σφάλμα στο deleteNote:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά τη διαγραφή σημείωσης' });
  }
}
