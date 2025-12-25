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

// GET categories for a specific service type
router.get('/:id/categories', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows]: any = await pool.query(`
            SELECT c.* 
            FROM categories c
            INNER JOIN service_type_categories stc ON c.id = stc.category_id
            WHERE stc.service_type_id = ?
            ORDER BY c.name ASC
        `, [id]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching categories for service type:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET tags for a specific service type
router.get('/:id/tags', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows]: any = await pool.query(`
            SELECT t.* 
            FROM tags t
            INNER JOIN service_type_tags stt ON t.id = stt.tag_id
            WHERE stt.service_type_id = ?
            ORDER BY t.name ASC
        `, [id]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching tags for service type:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Associate a category with a service type
router.post('/:id/categories/:categoryId', async (req, res) => {
    const { id, categoryId } = req.params;
    try {
        await pool.query(
            'INSERT IGNORE INTO service_type_categories (service_type_id, category_id) VALUES (?, ?)',
            [id, categoryId]
        );
        res.status(201).json({ message: 'Association created' });
    } catch (error) {
        console.error('Error creating category association:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Remove category association from service type
router.delete('/:id/categories/:categoryId', async (req, res) => {
    const { id, categoryId } = req.params;
    try {
        await pool.query(
            'DELETE FROM service_type_categories WHERE service_type_id = ? AND category_id = ?',
            [id, categoryId]
        );
        res.status(204).send();
    } catch (error) {
        console.error('Error removing category association:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Associate a tag with a service type
router.post('/:id/tags/:tagId', async (req, res) => {
    const { id, tagId } = req.params;
    try {
        await pool.query(
            'INSERT IGNORE INTO service_type_tags (service_type_id, tag_id) VALUES (?, ?)',
            [id, tagId]
        );
        res.status(201).json({ message: 'Association created' });
    } catch (error) {
        console.error('Error creating tag association:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Remove tag association from service type
router.delete('/:id/tags/:tagId', async (req, res) => {
    const { id, tagId } = req.params;
    try {
        await pool.query(
            'DELETE FROM service_type_tags WHERE service_type_id = ? AND tag_id = ?',
            [id, tagId]
        );
        res.status(204).send();
    } catch (error) {
        console.error('Error removing tag association:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
