import { pool } from '../db/pool.js';
import { isEmpty, ensureInteger } from '../utils/helpers.js';
export async function getUserProfile(req, res){
    try {
        const email = req.user.email;
        const profile = await getUserFullProfile(email);

        res.status(200).json(profile);
    } catch (error) {
        console.error('Σφάλμα στο getUserProfile:', error);
        res.status(500).json({ message: 'Σφάλμα κατά την ανάκτηση του προφίλ του χρήστη' });
    }
};

export async function getUserByEmail(req, res){
    try {
        const targetEmail = req.params.email;
        const viewerEmail = req.user.email;

        if(targetEmail === viewerEmail){
            const profile = await getUserFullProfile(targetEmail);
            return res.status(200).json(profile);
        }
        //temporary solution to prevent access to other users' profiles
        return res.status(403).json({ message: 'Δεν έχετε πρόσβαση σε προφίλ άλλων χρηστών' });
    } catch (error) {
        console.error('Σφάλμα στο getUserByEmail:', error);
        res.status(500).json({ message: 'Σφάλμα κατά την ανάκτηση του χρήστη' });
    }       
};

//helper function
export async function getUserFullProfile(email){   
    try {
        const userResult = await pool.query(
            `SELECT
                email,
                first_name,
                last_name,
                to_char(dob, 'YYYY-MM-DD') AS dob,
                birth_place,
                phone_no,
                mobile,
                occupation,
                user_type
             FROM users
             WHERE email = $1`,
            [email]
        );
        
        if(userResult.rows.length === 0){
            throw { status: 404, message: "Ο χρήστης δεν βρέθηκε" };
        }

        const user = sanitizeUser(userResult.rows[0]);

        // user_type sanity check
        if (!user.user_type) {
            throw { status: 500, message: 'Άδειο user_type μετά το sanitize' };
        };      

        switch (user.user_type) {
            case 'patient':
                const patientDetails = await pool.query(
                    `SELECT * FROM patient_details WHERE email = $1`,
                    [email]
                );
                user.details = patientDetails.rows[0] || {};
                break;
            
            case 'volunteer':
                const volunteerDetails = await pool.query(
                    `SELECT * FROM volunteer_details WHERE email = $1`,
                    [email]
                );
                user.details = volunteerDetails.rows[0] || {};
                break;
            
            case 'employee':
                const employeeDetails = await pool.query(
                    `SELECT * FROM employee_details WHERE email = $1`,
                    [email]
                );
                user.details = employeeDetails.rows[0] || {};
                break;
            
            default:
                throw { status: 400, message: 'Μη έγκυρος τύπος χρήστη' };
        }
        return user;
          
    } catch (error) {
        console.error('Σφάλμα στο getUserFullProfile:', error);
        throw error;
    }      
};

//helper function to sanitize user data
export function sanitizeUser(user) {
    if (!user) {
        return null;
    }

    // create copy for manipulation
    const cleanUser = { ...user };

    // Remove sensitive information
    if (cleanUser.password_hash) {
        delete cleanUser.password_hash;
    };  

    return cleanUser;
};

export async function deleteUserProfile(req, res) {
  try {
    const requester = req.user.email;
    const emailToDelete = req.params.email;

    // Permission check
    if (requester !== emailToDelete) {
      const canManage = await userHasPermission(requester, 'manage_users');
      if (!canManage) {
        return res.status(403).json({ message: 'Δεν έχετε δικαίωμα διαγραφής αυτού του χρήστη' });
      }
    }

    // Check if user exists
    const { rows: urows } = await pool.query(
      `SELECT email, user_type FROM users WHERE email = $1`,
      [emailToDelete]
    );
    if (!urows.length) return res.status(404).json({ message: 'Ο χρήστης δεν βρέθηκε' });
    const user = urows[0]; // { email, user_type }

    // Last admin protection
    const { rows: isAdminRows } = await pool.query(
      `SELECT 1 FROM user_roles WHERE email = $1 AND role_name = 'admin'`,
      [emailToDelete]
    );
    if (isAdminRows.length) {
      const { rows: adminCountRows } = await pool.query(
        `SELECT COUNT(*)::int AS cnt FROM user_roles WHERE role_name = 'admin'`
      );
      if (adminCountRows[0].cnt === 1) {
        return res.status(409).json({ message: 'Δεν μπορείτε να διαγράψετε τον τελευταίο διαχειριστή' });
      }
    }

    // Patient check placeholder

    // Transaction (reassign / force delete)
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (user.user_type === 'employee') {
        const { reassignTo, unassignRequests } = req.body ?? {};

        // support requests check (assigned/in_progress)
        const { rows: active } = await client.query(
          `SELECT request_id
           FROM support_requests
           WHERE assigned_employee_email = $1
             AND status IN ('assigned','in_progress')`,
          [emailToDelete]
        );

        if (active.length) {
          if (reassignTo && !unassignRequests) {
            // reassignTo validity check
            const { rows: targetEmp } = await client.query(
              `SELECT 1 FROM users WHERE email = $1 AND user_type = 'employee'`,
              [reassignTo]
            );
            if (!targetEmp.length) {
              await client.query('ROLLBACK');
              return res.status(400).json({ message: 'Ο χρήστης δεν είναι έγκυρος υπάλληλος. Παρακαλώ ελέγξτε τα στοιχεία και δοκιμάστε πάλι.' });
            }

            // Reassign
            await client.query(
              `UPDATE support_requests
               SET assigned_employee_email = $1,
                   updated_at = CURRENT_TIMESTAMP
               WHERE assigned_employee_email = $2
                 AND status IN ('assigned','in_progress')`,
              [reassignTo, emailToDelete]
            );
            // continue to delete flow
          } else if (unassignRequests) {
            await client.query(
              `UPDATE support_requests
               SET assigned_employee_email = null,
                   updated_at = CURRENT_TIMESTAMP
               WHERE assigned_employee_email = $2
                 AND status IN ('assigned','in_progress')`,
              [emailToDelete]
            );
          } else {
            await client.query('ROLLBACK');
            return res.status(409).json({
              message: 'Ο υπάλληλος έχει ενεργές αναθέσεις.' +
              'Παρακαλώ επιλέξτε αν θέλετε να αναθέσετε εκ νέου τα αιτήματα σε άλλον υπάλληλο ή να τα αφήσετε χωρίς ανάθεση.',
              blocking_requests: active.map(r => r.request_id)
            });
          }
        }
      }

      // Delete user
      await client.query('DELETE FROM users WHERE email = $1', [emailToDelete]);
      await client.query('COMMIT');
      return res.status(204).json({ message: 'Ο χρήστης διαγράφηκε με επιτυχία' });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('DB error on deleteUserProfile:', e);
      return res.status(500).json({ message: 'Σφάλμα κατά τη διαγραφή χρήστη' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Σφάλμα στο deleteUserProfile:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά τη διαγραφή χρήστη' });
  }
}

async function userHasPermission(email, permission) {
  try {
    const { rows } = await pool.query(
      `SELECT 1
       FROM user_roles ur
       JOIN role_permissions rp ON ur.role_name = rp.role_name
       WHERE ur.email = $1
         AND rp.permission_name = $2
       LIMIT 1`,
      [email, permission]
    );

    return rows.length > 0;
  } catch (error) {
    console.error('Σφάλμα στο userHasPermission:', error);
    throw error;
  }
}
//User update function (users & address_details)
//Input fields sanity check
const USER_UPDATABLE_FIELDS = new Set([
  'first_name', 'last_name', 'dob', 'birth_place',
  'phone_no', 'mobile', 'occupation', /* 'user_type' allowed only for admins */
]);

const ADDRESS_UPDATABLE_FIELDS = new Set([
  'address', 'address_no', 'postal_code', 'city'
]);

const ADDRESS_REQUIRED_ALL = ['address', 'address_no', 'postal_code', 'city']; // for initial insert

//Utility functions
function pickAllowed(obj = {}, allowed) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (allowed.has(k)) out[k] = v;
  }
  return out;
}

function buildSetClause(fields, paramOffset = 1) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return { setSQL: '', params: [] };
  const setSQL = keys.map((k, i) => `${k} = $${paramOffset + i}`).join(', ');
  const params = keys.map(k => fields[k]);
  return { setSQL, params };
}

function ensureISODate(dob) {
  if (dob == null) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dob))) {
    throw Object.assign(new Error('Λανθασμένη ημερομηνία γέννησης. Χρειάζεται "ΕΤΟΣ-ΜΗΝΑΣ-ΗΜΕΡΑ".'), { status: 400 });
  }
}

async function upsertAddressForEmail(client, email, addressFields) {
  if (isEmpty(addressFields)) return; // nothing to do

  // Try UPDATE first
  const { setSQL, params } = buildSetClause(addressFields, 1);
  if (!setSQL) return;

  const updateSQL = `
    UPDATE address_details
    SET ${setSQL}
    WHERE email = $${params.length + 1}
    RETURNING address, address_no, postal_code, city
  `;
  const upd = await client.query(updateSQL, [...params, email]);

  if (upd.rowCount > 0) return upd.rows[0];

  // No row to update → need INSERT; must have all required NOT NULL fields
  for (const required of ADDRESS_REQUIRED_ALL) {
    if (!(required in addressFields)) {
      throw Object.assign(
        new Error(`Δεν υπάρχει αυτή η διεύθυνση στην βάση δεδομένων. Υπολείπεται το πεδίο '${required}' για την δημιουργία της.`),
        { status: 400 }
      );
    }
  }

  const cols = ['email', ...Object.keys(addressFields)];
  const vals = [email, ...Object.values(addressFields)];
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');

  const insertSQL = `
    INSERT INTO address_details (${cols.join(', ')})
    VALUES (${placeholders})
    RETURNING address, address_no, postal_code, city
  `;
  const ins = await client.query(insertSQL, vals);
  return ins.rows[0];
}

export async function updateUser(req, res) {
  const actor = req.user; // action performer
  const {
    target_email,       // REQUIRED
    user_fields = {},   // OPTIONAL
    address_fields = {} // OPTIONAL
  } = req.body || {};

  try {
    if (!target_email) {
      throw Object.assign(new Error('Χρειάζεται το email του χρήστη που θα πραγματοποιηθούν οι αλλαγές.'), { status: 400 });
    }

    // Authorisation: only admins can update others; only admins can change user_type
    const isSelf = actor?.email === target_email;
    const canUpdateUsers = isSelf ? false : await userHasPermission(actor?.email, 'update_user');
    const canManageUsers = isSelf ? false : await userHasPermission(actor?.email, 'manage_users');


    if (!isSelf && !canUpdateUsers) {
      throw Object.assign(new Error('Δεν μπορείτε να πραγματοποιήσετε αλλαγές σε άλλους χρήστες.'), { status: 403 });
    }

    // No email change allowed here
    if ('email' in user_fields) {
      throw Object.assign(new Error('Το email δεν μπορεί να αλλάξει από αυτό το σημείο.'), { status: 400 });
    }

    // Whitelist fields
    const allowedUserFields = pickAllowed(user_fields, USER_UPDATABLE_FIELDS);
    if (canManageUsers && 'user_type' in user_fields) {
      allowedUserFields.user_type = user_fields.user_type;
    }

    const allowedAddressFields = pickAllowed(address_fields, ADDRESS_UPDATABLE_FIELDS);

    if (isEmpty(allowedUserFields) && isEmpty(allowedAddressFields)) {
      throw Object.assign(new Error('Δεν δόθηκαν έγκυρα πεδία για ενημέρωση στοιχείων'), { status: 400 });
    }

    // Light validation
    if ('dob' in allowedUserFields) ensureISODate(allowedUserFields.dob);
    if ('postal_code' in allowedAddressFields) ensureInteger(allowedAddressFields.postal_code, 'postal_code');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update users if needed
      if (!isEmpty(allowedUserFields)) {
        const { setSQL, params } = buildSetClause(allowedUserFields, 1);
        const sql = `
          UPDATE users
          SET ${setSQL}
          WHERE email = $${params.length + 1}
          RETURNING
            email,
            first_name,
            last_name,
            to_char(dob, 'YYYY-MM-DD') AS dob,
            birth_place,
            phone_no,
            mobile,
            occupation,
            user_type
        `;
        const r = await client.query(sql, [...params, target_email]);
        if (r.rows.length === 0) {
          throw Object.assign(new Error('No user found with that email'), { status: 404 });
        }
      } else {
        // No user fields changed → still ensure user exists
        const r = await client.query(
          `SELECT email,
                  first_name,
                  last_name,
                  to_char(dob,'YYYY-MM-DD') AS dob,
                  birth_place,
                  phone_no,
                  mobile,
                  occupation,
                  user_type
             FROM users WHERE email = $1`,
          [target_email]
        );
        if (r.rows.length === 0) {
          throw Object.assign(new Error('No user found with that email'), { status: 404 });
        }
      }

      // Update/insert address if needed
      if (!isEmpty(allowedAddressFields)) {
        await upsertAddressForEmail(client, target_email, allowedAddressFields);
      } else {
        // fetch existing address (if any) to return a complete picture
        const addr = await client.query(
          `SELECT address, address_no, postal_code, city
             FROM address_details WHERE email = $1`,
          [target_email]
        );
      }

      await client.query('COMMIT');

      // Final truth from DB (single JOIN), also doubles as a “RETURNING sanity check”
      const final = await pool.query(
        `SELECT u.email, u.first_name, u.last_name, to_char(u.dob,'YYYY-MM-DD') AS dob,
                u.birth_place, u.phone_no, u.mobile, u.occupation, u.user_type,
                a.address, a.address_no, a.postal_code, a.city
           FROM users u
           LEFT JOIN address_details a USING (email)
          WHERE u.email = $1`,
        [target_email]
      );

      // audit log (keep it simple; wire to your logger)
      console.info('User update:', {
        actor_email: actor?.email,
        actor_role: actor?.user_type,
        target_email,
        changed_user_fields: Object.keys(allowedUserFields),
        changed_address_fields: Object.keys(allowedAddressFields)
      });

      res.status(200).json({
        message: 'Το προφίλ ενωμερώθηκε με επιτυχία.',
        user: final.rows[0] // already safe (no password_hash)
      });
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    const status = error.status || 500;
    console.error('updateUser error:', error);
    res.status(status).json({ message: error.message || 'Error updating user' });
  }
}