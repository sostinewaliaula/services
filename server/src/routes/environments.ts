import { Router } from 'express';
import pool from '../db';

const router = Router();

// GET all environments
router.get('/', async (req, res) => {
    try {
        const [rows]: any = await pool.query('SELECT * FROM environments ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching environments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST create new environment
router.post('/', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    try {
        const [result]: any = await pool.query('INSERT INTO environments (name) VALUES (?)', [name]);
        const [rows]: any = await pool.query('SELECT * FROM environments WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating environment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT update environment
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    try {
        await pool.query('UPDATE environments SET name = ? WHERE id = ?', [name, id]);
        res.json({ id, name });
    } catch (error) {
        console.error('Error updating environment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE environment
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM environments WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting environment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
