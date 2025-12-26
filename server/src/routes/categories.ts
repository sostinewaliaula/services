import { Router } from 'express';
import pool from '../db';
import { handleDBError } from '../utils/errorHandler';

const router = Router();

// GET all categories
router.get('/', async (req, res) => {
    try {
        const [rows]: any = await pool.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// CREATE a category
router.post('/', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
        const [result]: any = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        handleDBError(res, error, 'Category');
    }
});

// UPDATE a category
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
        await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        handleDBError(res, error, 'Category');
    }
});

// DELETE a category
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
