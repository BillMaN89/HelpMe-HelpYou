import { pool } from '../db/pool.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { isEmpty, ensureInteger, validateRequired, isStrongPassword } from '../utils/helpers.js';
import dotenv from "dotenv";
import { getUserRolesAndPermissions } from '../utils/helpers.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = String(email).trim().toLowerCase();

    //check if user exists
    const { rows } = await pool.query(
      `SELECT email, first_name, last_name, user_type, password_hash
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );
    if (!rows.length) {
      return res.status(401).json({ message: 'Λάθος στοιχεία σύνδεσης' });
    }

    const u = rows[0];
    const isPasswordValid = await bcrypt.compare(password, u.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Λάθος στοιχεία σύνδεσης' });
    }

    // roles + permissions
    const { roles, permissions } = await getUserRolesAndPermissions(normalizedEmail);

    // Token
    const token = jwt.sign(
      {
        email: normalizedEmail,
        user_type: u.user_type,
        roles,
        permissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );

    return res.status(200).json({
      token,
      user: {
        email: normalizedEmail,
        first_name: u.first_name,
        last_name: u.last_name,
        user_type: u.user_type,
      },
      roles,
      permissions,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά την είσοδο' });
  }
};

//client-side logout
export const logoutUser = async (req, res) => {};


export const registerUser = async (req, res) => {
  const {
    // users table
    email,
    first_name,
    last_name,
    password,
    dob,
    birth_place,
    phone_no,
    mobile,
    occupation,
    user_type,

    // address_details
    address,
    address_no,
    postal_code,
    city,

    // patient_details
    disease_type,
    handicap,
    emergency_contact,

    // employee_details
    employee_type,
    department,
    has_vehicle,

    // volunteer extras
    help_types,
  } = req.body;

  const client = await pool.connect();
  try {
    // --- Basic validation ---
    if (!validateRequired([email, first_name, last_name, password, dob, mobile, user_type])) {
      return res.status(400).json({ message: "Λείπουν υποχρεωτικά πεδία χρήστη." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "Ο κωδικός πρέπει να έχει τουλάχιστον 12 χαρακτήρες, με πεζά, κεφαλαία, αριθμό και ειδικό σύμβολο.",
      });
    }

    if (!validateRequired([address, address_no, postal_code, city])) {
      return res.status(400).json({ message: "Λείπουν υποχρεωτικά πεδία διεύθυνσης." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (!['patient', 'employee', 'volunteer'].includes(user_type)) {
      return res.status(400).json({ message: "Μη έγκυρος τύπος χρήστη." });
    }

    if (user_type === 'patient') {
      if (!validateRequired([disease_type])) {
        return res.status(400).json({ message: "Λείπουν πεδία από τις πληροφορίες του ασθενή." });
      }
      const h = ensureInteger(handicap);
      if (Number.isNaN(h) || h < 0 || h > 100) {
        return res.status(400).json({ message: "Το ποσοστό αναπηρίας πρέπει να είναι ακέραιος αριθμός (0–100)." });
      }
    } else if (user_type === 'employee') {
      if (!validateRequired([employee_type, department])) {
        return res.status(400).json({ message: "Λείπουν πεδία από τις πληροφορίες του υπαλλήλου." });
      }
    } else if (user_type === 'volunteer') {
      if (isEmpty(occupation)) {
        return res.status(400).json({ message: "Λείπει το επάγγελμα του εθελοντή." });
      }
    }

    await client.query('BEGIN');

    const existing = await client.query('SELECT 1 FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rowCount) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'Ο χρήστης υπάρχει ήδη' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await client.query(
      `INSERT INTO users 
        (email, first_name, last_name, password_hash, dob, birth_place, phone_no, mobile, occupation, user_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        normalizedEmail,
        first_name,
        last_name,
        password_hash,
        dob,
        birth_place || null,
        phone_no || null,
        mobile,
        occupation || null,
        user_type,
      ]
    );

    await client.query(
      `INSERT INTO address_details (email, address, address_no, postal_code, city)
       VALUES ($1,$2,$3,$4,$5)`,
      [normalizedEmail, address, address_no, ensureInteger(postal_code), city]
    );

    if (user_type === 'patient') {
      await client.query(
        `INSERT INTO patient_details (email, disease_type, handicap, emergency_contact)
         VALUES ($1,$2,$3,$4)`,
        [normalizedEmail, disease_type, ensureInteger(handicap), emergency_contact || null]
      );
    }

    if (user_type === 'employee') {
      await client.query(
        `INSERT INTO employee_details (email, employee_type, department, has_vehicle)
         VALUES ($1,$2,$3,$4)`,
        [normalizedEmail, employee_type, department, Boolean(has_vehicle)]
      );
    }

    if (user_type === 'volunteer') {
      await client.query(
        `INSERT INTO volunteer_details (email, has_vehicle, occupation)
         VALUES ($1,$2,$3)`,
        [normalizedEmail, Boolean(has_vehicle), occupation]
      );

      if (Array.isArray(help_types) && help_types.length) {
        await upsertVolunteerHelpTypes(client, normalizedEmail, help_types);
      }
    }

    const role_name = resolveRoleForUser(user_type, department, employee_type);
    if (!role_name) {
      throw new Error('Αδυναμία αντιστοίχισης ρόλου για τον χρήστη.');
    }

    const roleExists = await client.query('SELECT 1 FROM roles WHERE role_name=$1', [role_name]);
    if (!roleExists.rowCount) {
      throw new Error(`O ρόλος '${role_name}' δεν υπάρχει. Πρόσθεσέ τον πρώτα στον πίνακα roles.`);
    }

    await client.query(
      `INSERT INTO user_roles (email, role_name) VALUES ($1,$2)`,
      [normalizedEmail, role_name]
    );

    //permissions for debugging
    const { rows: permRows } = await client.query(
      `SELECT DISTINCT rp.permission_name
      FROM user_roles ur
      JOIN role_permissions rp ON rp.role_name = ur.role_name
      WHERE ur.email = $1
      ORDER BY rp.permission_name`,
      [normalizedEmail]
    );
    const permissions = permRows.map(r => r.permission_name);

    await client.query('COMMIT');
    return res.status(201).json({ 
      message: 'Εγγραφή επιτυχής!', //debugger message
      email: normalizedEmail, 
      role_assigned: role_name,
      user: {
        first_name,
        last_name,
        dob,
        birth_place,
        phone_no,
        mobile,
        occupation,
        user_type,
        address: { address, address_no, postal_code: ensureInteger(postal_code), city },
        patient_details: user_type === 'patient' ? { disease_type, handicap: ensureInteger(handicap), emergency_contact } : undefined,
        employee_details: user_type === 'employee' ? { employee_type, department, has_vehicle: Boolean(has_vehicle) } : undefined,
        volunteer_details: user_type === 'volunteer' ? { occupation, has_vehicle: Boolean(has_vehicle), help_types: help_types || [] } : undefined,
        permissions
      }
    });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('Registration error:', err);
    const msg = err?.message || 'Σφάλμα κατά την εγγραφή';
    return res.status(500).json({ message: msg });
  } finally {
    client.release();
  }
};

export function resolveRoleForUser(user_type, department, employee_type) {
  const ut = (user_type || '').toLowerCase().trim();
  const dept = (department || '').toLowerCase().trim();
  const et = (employee_type || '').toLowerCase().trim();

  if (ut === 'patient') return 'patient';
  if (ut === 'volunteer') return 'volunteer';
  if (ut === 'employee') {
    if (et === 'board_member') return 'viewer'; 

    switch (dept) {
      case 'psychological_services': return 'therapist';
      case 'social_services':        return 'social_worker';
      case 'administration':         return 'secretary';
      case 'board_of_directors':
      case 'management':             return 'viewer';
      default:                       return null; 
    }
  }

  return null; //unknown user_type
}

export async function upsertVolunteerHelpTypes(client, email, helpTypes) {
  const ids = [];
  const namesToResolve = helpTypes.filter(v => typeof v === 'string');
  if (namesToResolve.length) {
    const { rows } = await client.query(
      `SELECT help_type_id, help_category FROM help_types WHERE help_category = ANY($1::text[])`,
      [namesToResolve]
    );
    const map = new Map(rows.map(r => [r.help_category, r.help_type_id]));
    for (const name of namesToResolve) {
      const id = map.get(name);
      if (!id) throw new Error(`Άγνωστο help_type: ${name}`);
      ids.push(id);
    }
  }
  for (const v of helpTypes) {
    if (typeof v === 'number') ids.push(v);
  }
  const unique = Array.from(new Set(ids));
  if (!unique.length) return;

  const values = unique.map((_, i) => `($1, $${i + 2})`).join(',');
  await client.query(
    `INSERT INTO volunteer_help_type (email, help_type_id) VALUES ${values} ON CONFLICT DO NOTHING`,
    [email, ...unique]
  );
}
