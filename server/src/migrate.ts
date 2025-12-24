import fs from 'fs';
import path from 'path';
import pool from './db';

async function migrate() {
    const targetFile = process.argv[2];
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    const connection = await pool.getConnection();

    try {
        // Check which migrations have already been run
        const [rows]: any = await connection.query('SELECT migration_name FROM migrations_log').catch(() => [[]]);
        const executedMigrations = rows.map((r: any) => r.migration_name);

        for (const file of files) {
            if (targetFile && file !== targetFile) continue;
            if (!executedMigrations.includes(file)) {
                console.log(`Running migration: ${file}`);
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

                // Split by semicolon to run multiple statements if needed, 
                // but be careful with complex SQL. Simple split is usually fine for basic migrations.
                const statements = sql.split(';').filter(s => s.trim() !== '');

                for (const statement of statements) {
                    await connection.query(statement);
                }

                await connection.query('INSERT INTO migrations_log (migration_name) VALUES (?)', [file]);
                console.log(`Successfully completed migration: ${file}`);
            } else {
                console.log(`Migration already executed: ${file}`);
            }
        }
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        connection.release();
        process.exit();
    }
}

migrate();
