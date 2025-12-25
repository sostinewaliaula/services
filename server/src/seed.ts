import fs from 'fs';
import path from 'path';
import pool from './db';

interface ServiceJSON {
    name: string;
    url: string;
    category: string;
    ip: string;
    icon?: string;
    displayUrl?: string;
}

async function seed() {
    const jsonPath = path.join(__dirname, '../../services.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const services: ServiceJSON[] = JSON.parse(rawData);

    const connection = await pool.getConnection();

    try {
        // 1. Get unique categories
        const categoriesSet = new Set<string>();
        services.forEach(s => categoriesSet.add(s.category));
        const categories = Array.from(categoriesSet);

        console.log(`Found ${categories.length} unique categories. Ensuring they exist...`);

        // 2. Insert categories and get their IDs
        const categoryMap = new Map<string, string>();
        for (const catName of categories) {
            await connection.query('INSERT IGNORE INTO categories (name) VALUES (?)', [catName]);
            const [rows]: any = await connection.query('SELECT id FROM categories WHERE name = ?', [catName]);
            categoryMap.set(catName, rows[0].id);
        }

        // 2.5 Ensure Service Types exist and get their IDs
        console.log('Ensuring service types exist...');
        const serviceTypes = ['Database', 'WebLogic', 'Generic'];
        const typeMap = new Map<string, string>();
        for (const typeName of serviceTypes) {
            await connection.query('INSERT IGNORE INTO service_types (name) VALUES (?)', [typeName]);
            const [rows]: any = await connection.query('SELECT id FROM service_types WHERE name = ?', [typeName]);
            typeMap.set(typeName, rows[0].id);
        }

        // 2.7 Ensure Environments exist
        console.log('Ensuring environments exist...');
        const envs = ['Production', 'Test', 'Dev'];
        const envMap = new Map<string, string>();
        for (const envName of envs) {
            await connection.query('INSERT IGNORE INTO environments (name) VALUES (?)', [envName]);
            const [rows]: any = await connection.query('SELECT id FROM environments WHERE name = ?', [envName]);
            envMap.set(envName, rows[0].id);
        }

        // 2.8 Ensure Teams exist
        console.log('Ensuring teams exist...');
        const teams = ['Infrastructure', 'Development', 'DevOps'];
        const teamMap = new Map<string, string>();
        for (const teamName of teams) {
            await connection.query('INSERT IGNORE INTO teams (name) VALUES (?)', [teamName]);
            const [rows]: any = await connection.query('SELECT id FROM teams WHERE name = ?', [teamName]);
            teamMap.set(teamName, rows[0].id);
        }

        console.log('Categories, Service Types, Environments, and Teams synced. Starting services insertion...');

        // 3. Insert services
        let insertedCount = 0;
        for (const s of services) {
            const categoryId = categoryMap.get(s.category);

            // Determine service type
            let serviceTypeId = typeMap.get('Generic');
            if (s.category.toLowerCase().includes('database')) {
                serviceTypeId = typeMap.get('Database');
            } else if (s.category.toLowerCase().includes('weblogic')) {
                serviceTypeId = typeMap.get('WebLogic');
            }

            // Extract port from URL if present
            let port: number | null = null;
            try {
                const urlObj = new URL(s.url);
                if (urlObj.port) {
                    port = parseInt(urlObj.port);
                } else if (urlObj.protocol === 'https:') {
                    port = 443;
                } else if (urlObj.protocol === 'http:') {
                    port = 80;
                }
            } catch (e) {
                // Fallback or ignore if URL is invalid
            }

            const query = `
        INSERT INTO services 
        (name, url, category_id, service_type_id, environment_id, team_id, ip_address, port, status, owner, isFeatured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

            const values = [
                s.name,
                s.url,
                categoryId,
                serviceTypeId,
                envMap.get('Production'),
                teamMap.get('Infrastructure'),
                s.ip || null,
                port,
                'Active',
                'System',
                s.category === 'featured' // Simple heuristic for featured
            ];

            await connection.query(query, values);
            insertedCount++;
        }

        console.log(`Successfully seeded ${insertedCount} services!`);

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        connection.release();
        process.exit();
    }
}

seed();
