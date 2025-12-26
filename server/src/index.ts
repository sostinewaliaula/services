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
import authRouter from './routes/auth';
import { startUptimeMonitor } from './uptime';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configure Multer for icon uploads in memory
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Routes
app.use('/api/services', servicesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/service-types', serviceTypesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/environments', environmentsRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/auth', authRouter);

// Icon Upload Endpoint - Returns base64 for preview
app.post('/api/upload/icon', upload.single('icon'), (req: any, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert to base64 data URI for instant preview in the form
    const base64 = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;

    res.json({ url: dataUri });
});

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

const host = process.env.HOST || '0.0.0.0';

app.listen(Number(port), host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

// Force restart
