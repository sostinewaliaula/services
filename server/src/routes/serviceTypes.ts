import { Router } from 'express';
import pool from '../db';

const router = Router();

// GET all service types
router.get('/', async (req, res) => {
    try {
        const [rows]: any = await pool.query('SELECT * FROM service_types ORDER BY name ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching service types:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// CREATE a service type
router.post('/', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
        const [result]: any = await pool.query('INSERT INTO service_types (name) VALUES (?)', [name]);
        res.status(201).json({ id: result.insertId, name });
    } catch (error) {
        console.error('Error creating service type:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// UPDATE a service type
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
        await pool.query('UPDATE service_types SET name = ? WHERE id = ?', [name, id]);
        res.json({ id, name });
    } catch (error) {
        console.error('Error updating service type:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE a service type
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM service_types WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting service type:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
