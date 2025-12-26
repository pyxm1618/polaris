import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const db = createClient({
    url: process.env.TURSO_DB_URL,
    authToken: process.env.TURSO_DB_TOKEN
});

async function verify() {
    console.log('Testing connection to Turso...');
    try {
        const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table';");
        console.log('✅ Connection Successful!');
        console.log('Tables found in database:');
        result.rows.forEach(row => {
            console.log(` - ${row.name}`);
        });
    } catch (e) {
        console.error('❌ Connection Failed:', e);
    }
}

verify();
