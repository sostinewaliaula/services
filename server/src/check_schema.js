
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await connection.query('DESCRIBE services');
        console.log('--- Services Table Schema ---');
        console.table(rows);
        rows.forEach((row, i) => console.log(`${i}: ${row.Field} (${row.Type})`));

        const [tags] = await connection.query('DESCRIBE tags');
        console.log('--- Tags Table Schema ---');
        console.table(tags);

        const [stags] = await connection.query('DESCRIBE service_tags');
        console.log('--- Service Tags Table Schema ---');
        console.table(stags);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkSchema();
