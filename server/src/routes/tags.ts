import { Router } from 'express';
import pool from '../db';

const router = Router();

// GET all tags
router.get('/', async (req, res) => {
    try {
        const [rows]: any = await pool.query('SELECT * FROM tags ORDER BY name ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// CREATE a tag
router.post('/', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
        const [result]: any = await pool.query('INSERT IGNORE INTO tags (name) VALUES (?)', [name]);
        const id = result.insertId || (await (pool.query('SELECT id FROM tags WHERE name = ?', [name]) as any))[0][0].id;
        res.status(201).json({ id, name });
    } catch (error) {
        console.error('Error creating tag:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// UPDATE a tag
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
        await pool.query('UPDATE tags SET name = ? WHERE id = ?', [name, id]);
        res.json({ id, name });
    } catch (error) {
        console.error('Error updating tag:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE a tag
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tags WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting tag:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
