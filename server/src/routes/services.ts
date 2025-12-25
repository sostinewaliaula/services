import { Router } from 'express';
import pool from '../db';
import { checkAllServices } from '../uptime';

const router = Router();

// Trigger manual uptime check
router.post('/uptime/check', async (req, res) => {
    try {
        // Run in background to avoid timeout
        checkAllServices();
        res.json({ message: 'Uptime check started' });
    } catch (error) {
        console.error('Error starting uptime check:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET service logo from DB
router.get('/:id/logo', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows]: any = await pool.query('SELECT logo_blob, logo_mime_type FROM services WHERE id = ?', [id]);

        if (rows.length === 0 || !rows[0].logo_blob) {
            return res.status(404).send('Logo not found');
        }

        const { logo_blob, logo_mime_type } = rows[0];
        res.setHeader('Content-Type', logo_mime_type || 'image/png');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send(logo_blob);
    } catch (error) {
        console.error('Error fetching logo:', error);
        res.status(500).send('Internal server error');
    }
});

// GET all services with category and type names
router.get('/', async (req, res) => {
    try {
        const query = `
      SELECT 
        s.*, 
        c.name as categoryName,
        st.name as typeName,
        e.name as environmentName,
        t.name as teamName
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN service_types st ON s.service_type_id = st.id
      LEFT JOIN environments e ON s.environment_id = e.id
      LEFT JOIN teams t ON s.team_id = t.id
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
            environment: row.environmentName,
            team: row.teamName,
            isFeatured: Boolean(row.isFeatured),
            logo_url: row.logo_blob ? `/api/services/${row.id}/logo` : row.logo_url,
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
            name, category_id, service_type_id, status, url,
            ip_address, port, owner, environment_id, team_id, notes, isFeatured,
            documentation, dashboard, db_connection, db_username, db_password, pdb_name,
            service_username, service_password, logo_url, tags
        } = req.body;

        const sanitizedEnvId = environment_id || null;
        const sanitizedTeamId = team_id || null;

        let logoBlob = null;
        let logoMimeType = null;
        let finalLogoUrl = logo_url;

        if (logo_url && logo_url.startsWith('data:')) {
            const matches = logo_url.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                logoMimeType = matches[1];
                logoBlob = Buffer.from(matches[2], 'base64');
                finalLogoUrl = null;
            }
        }

        const [result]: any = await connection.query(
            `INSERT INTO services (
                name, category_id, service_type_id, status, url,
                ip_address, port, owner, environment_id, team_id, notes, isFeatured,
                documentation, dashboard, db_connection, db_username, db_password, pdb_name,
                service_username, service_password, logo_url, logo_blob, logo_mime_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, category_id, service_type_id, status || 'Active', url,
                ip_address, port, owner, sanitizedEnvId, sanitizedTeamId, notes, isFeatured ? 1 : 0,
                documentation, dashboard, db_connection, db_username, db_password, pdb_name,
                service_username, service_password, finalLogoUrl, logoBlob, logoMimeType
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
            name, category_id, service_type_id, status, url,
            ip_address, port, owner, environment_id, team_id, notes, isFeatured,
            documentation, dashboard, db_connection, db_username, db_password, pdb_name,
            service_username, service_password, logo_url, tags
        } = req.body;

        const sanitizedEnvId = environment_id || null;
        const sanitizedTeamId = team_id || null;

        let logoBlob = null;
        let logoMimeType = null;
        let finalLogoUrl = logo_url;

        // If it's a data URI, it's a new upload to store in DB
        if (logo_url && logo_url.startsWith('data:')) {
            const matches = logo_url.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                logoMimeType = matches[1];
                logoBlob = Buffer.from(matches[2], 'base64');
                finalLogoUrl = null;
            }
        }
        // If it starts with /api/services, it's our DB logo URL - DON'T update blob columns unless we want to clear them
        else if (logo_url && logo_url.includes('/logo')) {
            // Keep existing blob by not including them in the SQL update if we logic it out, 
            // but for simplicity we'll just handle it by selecting them first or using COALESCE if needed.
            // Simplified: if logo_url is the same as current API URL, we don't change blobs.
        }

        let updateQuery = `UPDATE services SET 
                name = ?, category_id = ?, service_type_id = ?, status = ?, 
                url = ?, ip_address = ?, port = ?, 
                owner = ?, environment_id = ?, team_id = ?, notes = ?, isFeatured = ?, 
                documentation = ?, dashboard = ?, db_connection = ?, 
                db_username = ?, db_password = ?, pdb_name = ?, service_username = ?, service_password = ?`;

        let updateParams = [
            name, category_id, service_type_id, status, url,
            ip_address, port, owner, sanitizedEnvId, sanitizedTeamId, notes, isFeatured ? 1 : 0,
            documentation, dashboard, db_connection, db_username, db_password, pdb_name,
            service_username, service_password
        ];

        // Handle logo update specifically
        if (logo_url && logo_url.startsWith('data:')) {
            updateQuery += `, logo_url = NULL, logo_blob = ?, logo_mime_type = ?`;
            updateParams.push(logoBlob, logoMimeType);
        } else if (!logo_url) {
            // Clear logo
            updateQuery += `, logo_url = NULL, logo_blob = NULL, logo_mime_type = NULL`;
        } else if (!logo_url.includes('/logo')) {
            // New external URL
            updateQuery += `, logo_url = ?, logo_blob = NULL, logo_mime_type = NULL`;
            updateParams.push(logo_url);
        } else {
            // It's the current DB logo URL, explicitly keep it in logo_url
            updateQuery += `, logo_url = ?`;
            updateParams.push(logo_url);
        }

        updateQuery += ` WHERE id = ?`;
        updateParams.push(id);

        await connection.query(updateQuery, updateParams);

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
    } catch (error: any) {
        await connection.rollback();
        console.error('Error updating service:', error);
        console.error('Details:', error.message, error.stack);
        console.error('Request Body:', JSON.stringify(req.body, null, 2));
        res.status(500).json({ error: error.message || 'Internal server error' });
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
