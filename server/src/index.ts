import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test DB Connection Route
app.get('/api/test-db', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('SELECT 1');
        connection.release();
        res.json({ message: 'Connected to MariaDB database successfully!' });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Failed to connect to database' });
    }
});

app.get('/', (req, res) => {
    res.send('Backend server is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
