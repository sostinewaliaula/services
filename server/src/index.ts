import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';
import servicesRouter from './routes/services';
import categoriesRouter from './routes/categories';
import serviceTypesRouter from './routes/serviceTypes';
import tagsRouter from './routes/tags';
import environmentsRouter from './routes/environments';
import teamsRouter from './routes/teams';
import { startUptimeMonitor } from './uptime';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/services', servicesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/service-types', serviceTypesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/environments', environmentsRouter);
app.use('/api/teams', teamsRouter);

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

// Start Uptime Monitor
startUptimeMonitor();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Force restart
