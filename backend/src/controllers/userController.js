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

export async function getUserByEmail(){
    try {
        const targetEmail = req.params.email;
        const viewerEmail = req.user.email;

        if(targetEmail === viewerEmail){
            const profile = await getUserFullProfile(targetEmail);
            return res.status(200).json(profile);
        }
        //θα βάλω permission checks

    } catch (error) {
        console.error('Σφάλμα στο getUserByEmail:', error);
        res.status(500).json({ message: 'Σφάλμα κατά την ανάκτηση του χρήστη' });
    }
        
};

//helper function
export async function getUserFullProfile(email){   
    try {
        const userResult = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );
        
        if(userResult.rows.length === 0){
            throw { status: 404, message: "Ο χρήστης δεν βρέθηκε" };
        }

        const user = userResult.rows[0];
        // Remove sensitive information
        if (user.password_hash) {
            delete user.password_hash;
        };  
        
        if (user.dob) {
            user.dob = new Date(user.dob).toISOString().split('T')[0];
            //Traditional date format YYYY-MM-DD
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

export async function updateUserProfile(){

};


