import { Router } from 'express';
import pool from '../db';

const router = Router();

// GET all services with category and type names
router.get('/', async (req, res) => {
    try {
        const query = `
      SELECT 
        s.*, 
        c.name as categoryName,
        st.name as typeName
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN service_types st ON s.service_type_id = st.id
      ORDER BY s.name ASC
    `;
        const [rows]: any = await pool.query(query);

        // Fetch tags for all services
        const [tagRows]: any = await pool.query(`
            SELECT st.service_id, t.id, t.name 
            FROM service_tags st 
            JOIN tags t ON st.tag_id = t.id
        `);

        const tagsByServiceId = tagRows.reduce((acc: any, tag: any) => {
            if (!acc[tag.service_id]) acc[tag.service_id] = [];
            acc[tag.service_id].push({ id: tag.id, name: tag.name });
            return acc;
        }, {});

        const services = rows.map((row: any) => ({
            ...row,
            category: row.categoryName,
            serviceTypeName: row.typeName,
            isFeatured: Boolean(row.isFeatured),
            tags: tagsByServiceId[row.id] || []
        }));

        res.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// CREATE a new service
router.post('/', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const {
            name, description, category_id, service_type_id, status, environment, url,
            ip_address, port, owner, team, notes, isFeatured,
            documentation, dashboard, db_connection, db_username,
            service_username, service_password, tags
        } = req.body;

        const [result]: any = await connection.query(
            `INSERT INTO services (
                name, description, category_id, service_type_id, status, environment, url,
                ip_address, port, owner, team, notes, isFeatured,
                documentation, dashboard, db_connection, db_username,
                service_username, service_password
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, description, category_id, service_type_id, status, environment, url,
                ip_address, port, owner, team, notes, isFeatured ? 1 : 0,
                documentation, dashboard, db_connection, db_username,
                service_username, service_password
            ]
        );

        const serviceId = result.insertId;

        // Handle tags
        if (tags && Array.isArray(tags)) {
            for (const tagName of tags) {
                // Find or create tag
                const [tagResult]: any = await connection.query('INSERT IGNORE INTO tags (name) VALUES (?)', [tagName]);
                let tagId;
                if (tagResult.insertId) {
                    tagId = tagResult.insertId;
                } else {
                    const [existingTag]: any = await connection.query('SELECT id FROM tags WHERE name = ?', [tagName]);
                    tagId = existingTag[0].id;
                }
                await connection.query('INSERT INTO service_tags (service_id, tag_id) VALUES (?, ?)', [serviceId, tagId]);
            }
        }

        await connection.commit();
        res.status(201).json({ id: serviceId, message: 'Service created successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating service:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        connection.release();
    }
});

// UPDATE a service
router.put('/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const {
            name, description, category_id, service_type_id, status, environment, url,
            ip_address, port, owner, team, notes, isFeatured,
            documentation, dashboard, db_connection, db_username,
            service_username, service_password, tags
        } = req.body;

        await connection.query(
            `UPDATE services SET 
                name = ?, description = ?, category_id = ?, service_type_id = ?, status = ?, 
                environment = ?, url = ?, ip_address = ?, port = ?, 
                owner = ?, team = ?, notes = ?, isFeatured = ?, 
                documentation = ?, dashboard = ?, db_connection = ?, 
                db_username = ?, service_username = ?, service_password = ?
            WHERE id = ?`,
            [
                name, description, category_id, service_type_id, status, environment, url,
                ip_address, port, owner, team, notes, isFeatured ? 1 : 0,
                documentation, dashboard, db_connection, db_username,
                service_username, service_password, id
            ]
        );

        // Update tags
        if (tags && Array.isArray(tags)) {
            // Remove existing tags
            await connection.query('DELETE FROM service_tags WHERE service_id = ?', [id]);

            for (const tagName of tags) {
                const [tagResult]: any = await connection.query('INSERT IGNORE INTO tags (name) VALUES (?)', [tagName]);
                let tagId;
                if (tagResult.insertId) {
                    tagId = tagResult.insertId;
                } else {
                    const [existingTag]: any = await connection.query('SELECT id FROM tags WHERE name = ?', [tagName]);
                    tagId = existingTag[0].id;
                }
                await connection.query('INSERT INTO service_tags (service_id, tag_id) VALUES (?, ?)', [id, tagId]);
            }
        }

        await connection.commit();
        res.json({ message: 'Service updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        connection.release();
    }
});

// DELETE a service
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM services WHERE id = ?', [id]);
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
