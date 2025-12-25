import pool from './db';
import { RowDataPacket } from 'mysql2';

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TIMEOUT_MS = 5000; // 5 seconds timeout for requests

interface ServiceRow extends RowDataPacket {
    id: string;
    url: string | null;
    name: string;
}

// Helper to check a single URL
async function checkUrl(url: string): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        // Try HEAD first (lighter)
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (response.ok) return true;
            // If 405 Method Not Allowed, try GET
            if (response.status === 405) throw new Error('Method Not Allowed');
        } catch (headError) {
            // Ignore head error and try GET
        }

        // Try GET if HEAD failed or wasn't allowed
        const controllerGet = new AbortController();
        const timeoutIdGet = setTimeout(() => controllerGet.abort(), TIMEOUT_MS);

        const responseGet = await fetch(url, {
            method: 'GET',
            signal: controllerGet.signal
        });
        clearTimeout(timeoutIdGet);

        return responseGet.ok;

    } catch (error) {
        // console.error(`Ping failed for ${url}:`, error); // Optional logging
        return false;
    }
}

export async function checkAllServices() {
    console.log('Starting scheduled uptime check...');
    try {
        const [services] = await pool.query<ServiceRow[]>('SELECT id, url, name FROM services WHERE url IS NOT NULL AND url != ""');

        console.log(`Checking status for ${services.length} services...`);

        let onlineCount = 0;
        let offlineCount = 0;

        // Process in batches to avoid overwhelming the network/server
        const BATCH_SIZE = 10;
        for (let i = 0; i < services.length; i += BATCH_SIZE) {
            const batch = services.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (service) => {
                if (!service.url) return;

                const isOnline = await checkUrl(service.url);
                const status = isOnline ? 'Online' : 'Offline';

                if (isOnline) onlineCount++;
                else offlineCount++;

                // Update DB
                await pool.query('UPDATE services SET status = ? WHERE id = ?', [status, service.id]);
            }));
        }

        console.log(`Uptime check complete. Online: ${onlineCount}, Offline: ${offlineCount}`);

    } catch (error) {
        console.error('Error during uptime check:', error);
    }
}

export function startUptimeMonitor() {
    // Run immediately on start
    checkAllServices();

    // Schedule
    setInterval(checkAllServices, CHECK_INTERVAL);
    console.log(`Uptime monitor scheduled every ${CHECK_INTERVAL / 1000} seconds.`);
}
