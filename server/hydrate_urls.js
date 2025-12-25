
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const SERVICES_JSON_PATH = path.join('c:', 'Users', 'Sostine', 'Desktop', 'services', 'services.json');

async function hydrateUrls() {
    let connection;
    try {
        console.log('Reading services.json...');
        const rawData = fs.readFileSync(SERVICES_JSON_PATH, 'utf-8');
        const servicesData = JSON.parse(rawData);

        console.log(`Found ${servicesData.length} services in JSON file.`);

        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'mctm3223',
            database: process.env.DB_NAME || 'services'
        });

        console.log('Connected to MySQL.');

        let updatedCount = 0;
        let skippedCount = 0;
        let notFoundCount = 0;

        for (const service of servicesData) {
            if (!service.url) {
                skippedCount++;
                continue;
            }

            // Check if service exists in DB
            // Using case-insensitive match for robustness
            const [rows] = await connection.execute(
                'SELECT id, url FROM services WHERE LOWER(name) = LOWER(?)',
                [service.name]
            );

            if (rows.length === 0) {
                notFoundCount++;
                // console.log(`Service not found in DB: ${service.name}`);
            } else {
                const dbService = rows[0];

                // Update if URL is different or missing
                if (!dbService.url || dbService.url !== service.url) {
                    await connection.execute(
                        'UPDATE services SET url = ? WHERE id = ?',
                        [service.url, dbService.id]
                    );
                    updatedCount++;
                    process.stdout.write('.');
                } else {
                    skippedCount++;
                }
            }
        }

        console.log('\n------------------------------------------------');
        console.log('Hydration Complete');
        console.log(`Updated: ${updatedCount}`);
        console.log(`Skipped (No URL/Already matches): ${skippedCount}`);
        console.log(`Not Found in DB: ${notFoundCount}`);
        console.log('------------------------------------------------');

    } catch (err) {
        console.error('Error hydrating URLs:', err);
    } finally {
        if (connection) await connection.end();
    }
}

hydrateUrls();
