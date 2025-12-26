import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

// Load environment variables from .env
dotenv.config();

const url = process.env.TURSO_DB_URL;
const authToken = process.env.TURSO_DB_TOKEN;

if (!url || !authToken) {
    console.error('Error: Missing TURSO_DB_URL or TURSO_DB_TOKEN in .env');
    console.log('Please ensure you have created the .env file with the correct credentials.');
    process.exit(1);
}

const db = createClient({ url, authToken });

async function main() {
    const schemaPath = path.join(process.cwd(), 'server', 'db', 'schema.sql');

    if (!fs.existsSync(schemaPath)) {
        console.error(`Error: Schema file not found at ${schemaPath}`);
        process.exit(1);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log(`Connecting to database at ${url}...`);
    console.log('Applying schema...');

    try {
        await db.executeMultiple(schema);
        console.log('✅ Schema applied successfully! The database is ready.');
    } catch (e) {
        console.error('❌ Error applying schema:', e);
        process.exit(1);
    }
}

main();
