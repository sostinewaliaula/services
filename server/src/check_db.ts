import pool from './db';

async function check() {
    try {
        const [rows]: any = await pool.query('DESCRIBE services');
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

check();
