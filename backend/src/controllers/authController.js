import { pool } from '../db/pool.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

export const registerUser = async (req, res) => {
  const {
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
  } = req.body;

  try {
    // Έλεγχος αν υπάρχει ήδη χρήστης
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Ο χρήστης υπάρχει ήδη' });
    }

    // Κρυπτογράφηση κωδικού
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Εισαγωγή στη βάση
    await pool.query(
      `INSERT INTO users 
        (email, first_name, last_name, password_hash, dob, birth_place, phone_no, mobile, occupation, user_type)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        email,
        first_name,
        last_name,
        hashedPassword,
        dob,
        birth_place,
        phone_no,
        mobile,
        occupation,
        user_type,
      ]
    );

    res.status(201).json({ message: 'Εγγραφή επιτυχής!' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Σφάλμα κατά την εγγραφή' });
  }
};

export const loginUser = async (req, res) => {
  const {email, password} = req.body;
   try {
    // Έλεγχος αν υπάρχει ο χρήστης
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Λάθος στοιχεία σύνδεσης' });
    }

    // Έλεγχος κωδικού
    const isPasswordValid = await bcrypt.compare(password, user.rows[0].password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Λάθος στοιχεία σύνδεσης' });
    }

    // Δημιουργία token
    const { user_type } = user.rows[0];

    const token = jwt.sign(
      { email, user_type },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    // Αποστολή token στον xρήστη
    res.status(200).json({ token });
   } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Σφάλμα κατά την είσοδο' });
  }
};

//η αποσύνδεση είναι client side
export const logoutUser = async (req, res) => {};


