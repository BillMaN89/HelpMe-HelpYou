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


export async function deleteUserProfile(){
}
