import { Router } from 'express';
import pool from '../db';
import { handleDBError } from '../utils/errorHandler';

const router = Router();

// GET all teams
router.get('/', async (req, res) => {
    try {
        const [rows]: any = await pool.query('SELECT * FROM teams ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST create new team
router.post('/', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    try {
        const [result]: any = await pool.query('INSERT INTO teams (name) VALUES (?)', [name]);
        const [rows]: any = await pool.query('SELECT * FROM teams WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        handleDBError(res, error, 'Team');
    }
});

// PUT update team
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    try {
        await pool.query('UPDATE teams SET name = ? WHERE id = ?', [name, id]);
        res.json({ id, name });
    } catch (error) {
        handleDBError(res, error, 'Team');
    }
});

// DELETE team
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM teams WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting team:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
