import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db/pool.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Πτυχιακή backend on fire! 🔥');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

