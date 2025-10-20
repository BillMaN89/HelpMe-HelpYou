import { pool } from '../db/pool.js';
import { isEmpty, ensureInteger } from '../utils/helpers.js';

// List users (permission-aware of: manage_users, view_user, view_patient_info)
export async function listUsers(req, res) {
  try {
    const requester = req.user?.email;
    if (!requester) return res.status(401).json({ message: 'Μη εξουσιοδοτημένο αίτημα' });

    // permission check
    const canManage = await userHasPermission(requester, 'manage_users');
    const canView = await userHasPermission(requester, 'view_user');
    const canViewPatientInfo = await userHasPermission(requester, 'view_patient_info');

    if (!canManage && !canView && !canViewPatientInfo) {
      return res.status(403).json({ message: 'Δεν έχετε δικαίωμα προβολής χρηστών' });
    }

    // pagination
    const pageParam = ensureInteger(req.query?.page);
    const sizeParam = ensureInteger(req.query?.pageSize ?? req.query?.limit);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const pageSizeRaw = Number.isFinite(sizeParam) && sizeParam > 0 ? sizeParam : 20;
    const pageSize = Math.min(pageSizeRaw, 100); // safety cap
    const offset = (page - 1) * pageSize;

    const { rows } = await pool.query(
      `SELECT u.email,
              u.first_name,
              u.last_name,
              to_char(u.dob,'YYYY-MM-DD') AS dob,
              u.user_type,
              COALESCE(
                ARRAY(
                  SELECT ur2.role_name
                  FROM user_roles ur2
                  WHERE ur2.email = u.email
                  ORDER BY ur2.role_name
                ),
                ARRAY[]::text[]
              ) AS roles,
              COUNT(*) OVER() AS total_count
         FROM users u
        ORDER BY u.last_name, u.first_name
        LIMIT $1 OFFSET $2`,
      [pageSize, offset]
    );

    const total = rows[0]?.total_count ?? 0;
    const users = rows.map(({ total_count, ...user }) => user);

    return res.status(200).json({
      users,
      meta: {
        page,
        pageSize,
        total,
        totalPages: pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1,
      },
    });
  } catch (error) {
    console.error('Σφάλμα στο listUsers:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά την προβολή χρηστών' });
  }
}

// Whitelisted fields for update
const USER_UPDATABLE_FIELDS = new Set([
  'first_name', 'last_name', 'dob', 'birth_place',
  'phone_no', 'mobile', 'occupation', // user_type (admin only)
]);
const ADDRESS_UPDATABLE_FIELDS = new Set([
  'address', 'address_no', 'postal_code', 'city'
]);
const ADDRESS_REQUIRED_ALL = ['address', 'address_no', 'postal_code', 'city'];

const PATIENT_UPDATABLE   = new Set(['disease_type','handicap','emergency_contact']);
const VOLUNTEER_UPDATABLE = new Set(['occupation','has_vehicle']);
// split for employee: common vs admin-only
const EMPLOYEE_UPDATABLE_COMMON = new Set(['has_vehicle']);
const EMPLOYEE_UPDATABLE_ADMIN  = new Set(['department','employee_type']);


//View own profile
export async function getUserProfile(req, res) {
  try {
    const viewerEmail = req.user.email;
    const full = await getUserFullProfile(viewerEmail);
    const shaped = await shapeProfileForViewer(full, { viewerEmail, targetEmail: viewerEmail });
    return res.status(200).json(shaped);
  } catch (error) {
    console.error('Σφάλμα στο getUserProfile:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά την ανάκτηση του προφίλ του χρήστη' });
  }
}

//Admin view
export async function getUserByEmail(req, res) {
  try {
    const targetEmail = req.params.email;
    const viewerEmail = req.user.email;

    if (targetEmail === viewerEmail) {
      const full = await getUserFullProfile(targetEmail);
      const shaped = await shapeProfileForViewer(full, { viewerEmail, targetEmail });
      return res.status(200).json(shaped);
    }

    // Permissions per requirements:
    // - admin (manage_users) can view others
    // - secretary (view_user) can view others
    // - therapist/social_worker (view_patient_info) can view others (esp. patients)
    const canManageUsers = await userHasPermission(viewerEmail, 'manage_users');
    const canViewUsers = await userHasPermission(viewerEmail, 'view_user');
    const canViewPatientInfo = await userHasPermission(viewerEmail, 'view_patient_info');

    if (!canManageUsers && !canViewUsers && !canViewPatientInfo) {
      return res.status(403).json({ message: 'Δεν έχετε πρόσβαση σε προφίλ άλλων χρηστών' });
    }

    const full = await getUserFullProfile(targetEmail);
    const shaped = await shapeProfileForViewer(full, { viewerEmail, targetEmail });
    return res.status(200).json(shaped);
  } catch (error) {
    console.error('Σφάλμα στο getUserByEmail:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά την ανάκτηση του χρήστη' });
  }
}

//User update (users + address + role-based details)
export async function updateUser(req, res) {
  const actor = req.user; // action performer
  const {
    target_email,        // REQUIRED
    user_fields = {},    // OPTIONAL (users table)
    address_fields = {}, // OPTIONAL (address_details table)
    details_fields = {}, // OPTIONAL (patient/volunteer/employee details)
  } = req.body || {};

  try {
    if (!target_email) {
      throw Object.assign(
        new Error('Χρειάζεται το email του χρήστη που θα πραγματοποιηθούν οι αλλαγές.'),
        { status: 400 }
      );
    }

    // Authorisation
    const isSelf = actor?.email === target_email;
    const canUpdateUsers = isSelf ? false : await userHasPermission(actor?.email, 'update_user');
    const canManageUsers = isSelf ? false : await userHasPermission(actor?.email, 'manage_users');

    if (!isSelf && !canUpdateUsers) {
      throw Object.assign(
        new Error('Δεν μπορείτε να πραγματοποιήσετε αλλαγές σε άλλους χρήστες.'),
        { status: 403 }
      );
    }

    if ('email' in user_fields) {
      throw Object.assign(new Error('Το email δεν μπορεί να αλλάξει.'), { status: 400 });
    }

    // Whitelist core fields
    const allowedUserFields = pickAllowed(user_fields, USER_UPDATABLE_FIELDS);
    if (canManageUsers && 'user_type' in user_fields) {
      allowedUserFields.user_type = user_fields.user_type;
    }
    const allowedAddressFields = pickAllowed(address_fields, ADDRESS_UPDATABLE_FIELDS);

    // Role-based details (whitelist per user_type)
    let allowedDetailsFields = {};
    let targetType = null;

    if (!isEmpty(details_fields)) {
      // find target user_type once
      const { rows: rtype } = await pool.query(
        `SELECT user_type FROM users WHERE email = $1`,
        [target_email]
      );
      if (!rtype.length) {
        throw Object.assign(new Error('Δεν βρέθηκε χρήστης με αυτό το email.'), { status: 404 });
      }
      targetType = rtype[0].user_type;

      const pick = (obj, allowSet) => {
        const out = {};
        for (const [k, v] of Object.entries(obj)) {
          if (allowSet.has(k)) out[k] = v;
        }
        return out;
      };

      if (targetType === 'patient') {
        allowedDetailsFields = pick(details_fields, PATIENT_UPDATABLE);
      } else if (targetType === 'volunteer') {
        allowedDetailsFields = pick(details_fields, VOLUNTEER_UPDATABLE);
      } else if (targetType === 'employee') {
        // has_vehicle is editable by update_user; department/employee_type only by manage_users
        const common = pick(details_fields, EMPLOYEE_UPDATABLE_COMMON);
        const adminOnly = canManageUsers ? pick(details_fields, EMPLOYEE_UPDATABLE_ADMIN) : {};
        allowedDetailsFields = { ...common, ...adminOnly };
      }

      // editing details of others still requires update_user (ή self)
      if (!isSelf && !canUpdateUsers) {
        throw Object.assign(new Error('Δεν μπορείτε να αλλάξετε τα επιπλέον στοιχεία.'), { status: 403 });
      }
    }

    // Validate light rules
    if ('dob' in allowedUserFields) ensureISODate(allowedUserFields.dob);
    if ('postal_code' in allowedAddressFields) ensureInteger(allowedAddressFields.postal_code, 'postal_code');

    // If nothing to update, reject
    if (
      isEmpty(allowedUserFields) &&
      isEmpty(allowedAddressFields) &&
      isEmpty(allowedDetailsFields)
    ) {
      throw Object.assign(
        new Error('Δεν δόθηκαν έγκυρα πεδία για ενημέρωση στοιχείων'),
        { status: 400 }
      );
    }

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
          RETURNING email, first_name, last_name, to_char(dob,'YYYY-MM-DD') AS dob,
                    birth_place, phone_no, mobile, occupation, user_type
        `;
        const r = await client.query(sql, [...params, target_email]);
        if (r.rows.length === 0) {
          throw Object.assign(new Error('Δεν βρέθηκε χρήστης με αυτό το email.'), { status: 404 });
        }
        // update user_type if changed by admin
        if (!targetType && allowedUserFields.user_type) {
          targetType = allowedUserFields.user_type;
        }
      } else {
        // Ensure user exists anyway
        const r = await client.query(
          `SELECT email FROM users WHERE email = $1`,
          [target_email]
        );
        if (r.rows.length === 0) {
          throw Object.assign(new Error('Δεν βρέθηκε χρήστης με αυτό το email.'), { status: 404 });
        }
      }

      if (!isEmpty(allowedAddressFields)) {
        await upsertAddressForEmail(client, target_email, allowedAddressFields);
      } else {
        await client.query(
          `SELECT 1 FROM address_details WHERE email = $1`,
          [target_email]
        );
      }

      // Update/insert role-based details if needed
      if (!isEmpty(allowedDetailsFields)) {
        if (!targetType) {
          const { rows: rtype2 } = await pool.query(
            `SELECT user_type FROM users WHERE email = $1`,
            [target_email]
          );
          targetType = rtype2[0]?.user_type || null;
        }

        if (targetType === 'patient') {
          await upsertDetails(client, 'patient_details', 'email', target_email, allowedDetailsFields);
        } else if (targetType === 'volunteer') {
          await upsertDetails(client, 'volunteer_details', 'email', target_email, allowedDetailsFields);
          // NOTE: help_types παραμένουν εκτός του παρόντος endpoint, TODO σε επόμενο κύκλο
        } else if (targetType === 'employee') {
          await upsertDetails(client, 'employee_details', 'email', target_email, allowedDetailsFields);
        }
      }

      await client.query('COMMIT');

      // --- unified response (ίδιο shape με GET /users/me) ---
      const fullProfile = await getUserFullProfile(target_email);
      const shaped = await shapeProfileForViewer(fullProfile, {
        viewerEmail: actor?.email,
        targetEmail: target_email
      });

      return res.status(200).json({
        message: 'Το προφίλ ενημερώθηκε με επιτυχία.',
        user: shaped
      });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    const status = error.status || 500;
    console.error('updateUser error:', error);
    return res.status(status).json({
      message: error.message || 'Σφάλμα κατά την ενημέρωση του χρήστη.'
    });
  }
}


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
               WHERE assigned_employee_email = $1
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

      // Delete action
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

// List all roles (admin only)
export async function listRoles(req, res) {
  try {
    const requester = req.user?.email;
    const canManage = await userHasPermission(requester, 'manage_users');
    if (!canManage) return res.status(403).json({ message: 'Απαγορεύεται' });
    const { rows } = await pool.query(`SELECT role_name FROM roles ORDER BY role_name`);
    return res.status(200).json({ roles: rows.map(r => r.role_name) });
  } catch (error) {
    console.error('Σφάλμα στο listRoles:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά την ανάκτηση ρόλων' });
  }
}

// Set roles for a user (admin only)
export async function setUserRoles(req, res) {
  const requester = req.user?.email;
  const targetEmail = req.params.email;
  const roles = Array.isArray(req.body?.roles) ? req.body.roles.map(String) : null;
  try {
    const canManage = await userHasPermission(requester, 'manage_users');
    if (!canManage) return res.status(403).json({ message: 'Απαγορεύεται' });
    if (!roles) return res.status(400).json({ message: 'Λείπει η λίστα ρόλων' });

    // Validate target exists
    const { rows: u } = await pool.query(`SELECT email FROM users WHERE email = $1`, [targetEmail]);
    if (!u.length) return res.status(404).json({ message: 'Ο χρήστης δεν βρέθηκε' });

    // Validate roles exist
    const { rows: allRoles } = await pool.query(`SELECT role_name FROM roles`);
    const roleSet = new Set(allRoles.map(r => r.role_name));
    for (const r of roles) {
      if (!roleSet.has(r)) return res.status(400).json({ message: `Μη έγκυρος ρόλος: ${r}` });
    }

    // Current roles
    const { rows: curRows } = await pool.query(
      `SELECT role_name FROM user_roles WHERE email = $1`,
      [targetEmail]
    );
    const current = new Set(curRows.map(r => r.role_name));
    const desired = new Set(roles);
    const toAdd = roles.filter(r => !current.has(r));
    const toRemove = [...current].filter(r => !desired.has(r));

    // Last admin protection if removing 'admin'
    if (toRemove.includes('admin')) {
      const { rows: adminCountRows } = await pool.query(
        `SELECT COUNT(*)::int AS cnt FROM user_roles WHERE role_name = 'admin'`
      );
      if (adminCountRows[0].cnt === 1) {
        return res.status(409).json({ message: 'Δεν μπορείτε να αφαιρέσετε τον τελευταίο διαχειριστή' });
      }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (toRemove.length) {
        await client.query(
          `DELETE FROM user_roles WHERE email = $1 AND role_name = ANY($2::text[])`,
          [targetEmail, toRemove]
        );
      }
      for (const r of toAdd) {
        await client.query(
          `INSERT INTO user_roles (email, role_name) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [targetEmail, r]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return res.status(200).json({ message: 'Οι ρόλοι ενημερώθηκαν', roles: roles });
  } catch (error) {
    console.error('Σφάλμα στο setUserRoles:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά την ενημέρωση ρόλων' });
  }
}

//Helper functions
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

async function upsertDetails(client, table, pkCol, pkVal, fields) {
  const keys = Object.keys(fields);
  if (!keys.length) return;

  // UPDATE first
  const { setSQL, params } = buildSetClause(fields, 1);
  const upd = await client.query(
    `UPDATE ${table} SET ${setSQL} WHERE ${pkCol} = $${params.length + 1}`,
    [...params, pkVal]
  );
  if (upd.rowCount > 0) return;

  // INSERT if no row to update
  const cols = [pkCol, ...keys];
  const vals = [pkVal, ...keys.map(k => fields[k])];
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  await client.query(
    `INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders})`,
    vals
  );
}


async function getUserFullProfile(email) {
  try {
    //basic info
    const { rows: urows } = await pool.query(
      `SELECT
         u.email, u.first_name, u.last_name,
         to_char(u.dob, 'YYYY-MM-DD') AS dob,
         u.birth_place, u.phone_no, u.mobile,
         u.occupation, u.user_type,
         a.address, a.address_no, a.postal_code, a.city
       FROM users u
       LEFT JOIN address_details a ON a.email = u.email
       WHERE u.email = $1`,
      [email]
    );
    if (!urows.length) throw { status: 404, message: 'Ο χρήστης δεν βρέθηκε' };

    const base = urows[0];

    //roles + permissions
    const { rows: rrows } = await pool.query(
      `SELECT ur.role_name
         FROM user_roles ur
        WHERE ur.email = $1`,
      [email]
    );
    const roles = rrows.map(r => r.role_name);

    const { rows: prows } = await pool.query(
      `SELECT DISTINCT rp.permission_name
         FROM user_roles ur
         JOIN role_permissions rp ON rp.role_name = ur.role_name
        WHERE ur.email = $1
        ORDER BY rp.permission_name`,
      [email]
    );
    const permissions = prows.map(p => p.permission_name);

    //user type details
    let details = {};
    if (base.user_type === 'patient') {
      const { rows } = await pool.query(
        `SELECT disease_type, handicap, emergency_contact
           FROM patient_details WHERE email = $1`,
        [email]
      );
      details = rows[0] || {};
    } else if (base.user_type === 'employee') {
      const { rows } = await pool.query(
        `SELECT employee_type, department, has_vehicle
           FROM employee_details WHERE email = $1`,
        [email]
      );
      details = rows[0] || {};
    } else if (base.user_type === 'volunteer') {
      const { rows } = await pool.query(
        `SELECT v.has_vehicle, v.occupation
           FROM volunteer_details v
          WHERE v.email = $1`,
        [email]
      );
      details = rows[0] || {};

      // help_types for volunteer
      const { rows: hrows } = await pool.query(
        `SELECT ht.help_type_id, ht.help_category
           FROM volunteer_help_type vht
           JOIN help_types ht ON ht.help_type_id = vht.help_type_id
          WHERE vht.email = $1
          ORDER BY ht.help_type_id`,
        [email]
      );
      details.help_types = hrows.map(h => ({
        help_type_id: h.help_type_id,
        help_category: h.help_category,
      }));
    } else {
      throw { status: 400, message: 'Μη έγκυρος τύπος χρήστη' };
    }

    //profile assembly
    const profile = {
      email: base.email,
      first_name: base.first_name,
      last_name: base.last_name,
      dob: base.dob,
      birth_place: base.birth_place,
      phone_no: base.phone_no,
      mobile: base.mobile,
      occupation: base.occupation,
      user_type: base.user_type,
      address: {
        address: base.address,
        address_no: base.address_no,
        postal_code: base.postal_code,
        city: base.city,
      },
      roles,
      permissions,
      details,
    };

    return profile;
  } catch (error) {
    console.error('Σφάλμα στο getUserFullProfile:', error);
    throw error;
  }
}

// Shape profile for viewer using permission-based admin check
// - Admin (has 'manage_roles') -> sees everything
// - Non-admin self -> limited per user_type
async function shapeProfileForViewer(profile, { viewerEmail, targetEmail }) {
  const isAdmin = await userHasPermission(viewerEmail, 'manage_roles');
  const isSelf = viewerEmail === targetEmail;
  const canViewPatientInfo = await userHasPermission(viewerEmail, 'view_patient_info');

  const shaped = {
    email: profile.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    dob: profile.dob,
    birth_place: profile.birth_place,
    phone_no: profile.phone_no,
    mobile: profile.mobile,
    occupation: profile.occupation,
    user_type: profile.user_type,
    address: profile.address ?? null,
  };

  if (isAdmin) {
    return {
      ...shaped,
      roles: profile.roles ?? [],
      permissions: profile.permissions ?? [],
      details: profile.details ?? {},
    };
  }

  if (isSelf) {
    // Expose own roles and permissions so the frontend can render nav/guards
    shaped.roles = profile.roles ?? [];
    shaped.permissions = profile.permissions ?? [];

    if (profile.user_type === 'patient') {
      shaped.details = {
        disease_type: profile.details?.disease_type ?? null,
        handicap: profile.details?.handicap ?? null,
        emergency_contact: profile.details?.emergency_contact ?? null,
      };
    } else if (profile.user_type === 'volunteer') {
      shaped.details = {
        occupation: profile.details?.occupation ?? null,
        has_vehicle: !!profile.details?.has_vehicle,
        help_types: Array.isArray(profile.details?.help_types) ? profile.details.help_types : [],
      };
    } else if (profile.user_type === 'employee') {
      shaped.details = {
        department: profile.details?.department ?? null,
        has_vehicle: !!profile.details?.has_vehicle,
      };
    } else {
      shaped.details = {};
    }
    return shaped;
  }

  // Viewing others, non-admin:
  // Allow exposing patient details if viewer has view_patient_info
  if (profile.user_type === 'patient' && canViewPatientInfo) {
    shaped.details = {
      disease_type: profile.details?.disease_type ?? null,
      handicap: profile.details?.handicap ?? null,
      emergency_contact: profile.details?.emergency_contact ?? null,
    };
  }

  return shaped;
}
