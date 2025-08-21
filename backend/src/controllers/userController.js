import { pool } from '../db/pool.js';
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

        // safety check για user_type
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

//helper function to perform user update
async function performUserUpdate(email, fieldsToUpdate){
    try {
        if (!fieldsToUpdate || Object.keys(fieldsToUpdate).length === 0) {
            throw new Error('Δεν παρέχονται πεδία για ενημέρωση');
        }
        //keys and values
        const keys = Object.keys(fieldsToUpdate);
        const values = Object.values(fieldsToUpdate);

        //create query string
        const setClauses = keys.map((key, index) => `${key} = $${index + 1}`);
        const setString = setClauses.join(', ');

        const query = `
            UPDATE users
            SET ${setString}
            WHERE email = $${keys.length + 1}
            RETURNING
            email,
            first_name,
            last_name,
            to_char(dob,'YYYY-MM-DD') AS dob,
            birth_place,
            phone_no,
            mobile,
            occupation,
            user_type`;

        //execute query
        const params = [...values, email];
        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            throw new Error('Δεν βρέθηκε χρήστης με αυτό το email');
        }

        //sanitize and return updated user
        return sanitizeUser(result.rows[0]);
    } catch (error) {
        console.error('Σφάλμα στο performUserUpdate:', error);
        throw error;
    }
};

export async function updateUserProfile(req, res){
    try {
        const email = req.user.email;
        const fieldsToUpdate = req.body;

        const updatedUser = await performUserUpdate(email, fieldsToUpdate);

        res.status(200).json({
            message: 'Το προφίλ ενημερώθηκε επιτυχώς',
            user: updatedUser
        });
    } catch (error) {
        console.error('Σφάλμα στο updateUserProfile:', error);
        res.status(500).json({ message: 'Σφάλμα κατά την ενημέρωση του προφίλ του χρήστη' });
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
        const { reassignTo, force } = req.body ?? {};

        // support requests check (assigned/in_progress)
        const { rows: active } = await client.query(
          `SELECT request_id
           FROM support_requests
           WHERE assigned_employee_email = $1
             AND status IN ('assigned','in_progress')`,
          [emailToDelete]
        );

        if (active.length) {
          if (reassignTo && !force) {
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
          } else if (force) {
            // Force delete: will set assigned_employee_email to NULL 
          } else {
            await client.query('ROLLBACK');
            return res.status(409).json({
              message: 'Ο υπάλληλος έχει ενεργές αναθέσεις. Πρέπει να ανατεθούν αλλού ή να γίνει force delete.',
              blocking_requests: active.map(r => r.request_id)
            });
          }
        }
      }

      // Delete user
      await client.query('DELETE FROM users WHERE email = $1', [emailToDelete]);
      // CASCADE: address_details, patient_details, employee_details, volunteer_details,
      // volunteer_availability, volunteer_help_type, user_roles, support_requests.user_email
      // SET NULL: support_requests.assigned_employee_email (για employees) 

      await client.query('COMMIT');
      return res.status(204).send();
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


