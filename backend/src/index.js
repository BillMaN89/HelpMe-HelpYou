import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db/pool.js';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
//Authentication
app.use('/api/auth', authRoutes);
//Requests
app.use('/api/requests', requestRoutes);
//Users
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Πτυχιακή backend on fire! 🔥');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Connection error:', err);
    } else {
        console.log('DB connected. Current time:', res.rows[0].now);
    }
});

//cors alternative configuration
// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: false, //needs true in case of cookies
//   methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));