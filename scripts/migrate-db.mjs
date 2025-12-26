import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const url = process.env.TURSO_DB_URL;
const authToken = process.env.TURSO_DB_TOKEN;

if (!url || !authToken) {
    console.error('Error: Missing TURSO_DB_URL or TURSO_DB_TOKEN in .env');
    process.exit(1);
}

const db = createClient({ url, authToken });

async function main() {
    console.log(`Connecting to database at ${url}...`);
    console.log('Running migration...');

    try {
        // 1. 创建 north_stars 表（如果不存在）
        console.log('Creating north_stars table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS north_stars (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                year INTEGER NOT NULL,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `);

        // 2. 创建新的 goals 表（重命名旧表先）
        console.log('Checking goals table...');
        const tablesResult = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='goals'");

        if (tablesResult.rows.length > 0) {
            // 检查是否有 north_star_id 列
            const colsResult = await db.execute("PRAGMA table_info(goals)");
            const hasNorthStarId = colsResult.rows.some(row => row.name === 'north_star_id');

            if (!hasNorthStarId) {
                console.log('Adding north_star_id column to goals table...');
                await db.execute("ALTER TABLE goals ADD COLUMN north_star_id TEXT");
            }
        } else {
            console.log('Creating goals table...');
            await db.execute(`
                CREATE TABLE goals (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    north_star_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    target_date TEXT,
                    status TEXT DEFAULT 'active',
                    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                    FOREIGN KEY (north_star_id) REFERENCES north_stars(id) ON DELETE CASCADE
                )
            `);
        }

        // 3. 创建 projects 表（如果不存在）
        console.log('Checking projects table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                primary_domain TEXT NOT NULL DEFAULT 'dev',
                description TEXT,
                status TEXT DEFAULT 'active',
                total_estimated_hours INTEGER DEFAULT 0,
                is_template INTEGER DEFAULT 0,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `);

        // 4. 创建 goal_project_relations 表
        console.log('Creating goal_project_relations table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS goal_project_relations (
                goal_id TEXT NOT NULL,
                project_id TEXT NOT NULL,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                PRIMARY KEY (goal_id, project_id),
                FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        `);

        // 5. 创建 tasks 表
        console.log('Checking tasks table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                domain TEXT,
                estimated_hours INTEGER DEFAULT 1,
                sequence_order INTEGER DEFAULT 0,
                status TEXT DEFAULT 'todo',
                scheduled_date TEXT,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        `);

        // 6. 创建 user_preferences 表
        console.log('Creating user_preferences table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS user_preferences (
                user_id TEXT PRIMARY KEY,
                weekly_hours_limit INTEGER DEFAULT 40,
                max_parallel_projects INTEGER DEFAULT 3,
                granularity_preference TEXT DEFAULT 'day',
                updated_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `);

        // 7. 创建 domains 表
        console.log('Creating domains table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS domains (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                color TEXT,
                icon TEXT,
                is_preset INTEGER DEFAULT 0,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `);

        // 8. 创建 wizard_drafts 表
        console.log('Creating wizard_drafts table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS wizard_drafts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL UNIQUE,
                current_step INTEGER DEFAULT 1,
                data TEXT NOT NULL,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `);

        // 9. 创建索引（忽略失败）
        console.log('Creating indexes...');
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_goals_north_star ON goals(north_star_id)',
            'CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id)',
            'CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_domains_user ON domains(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_wizard_drafts_user ON wizard_drafts(user_id)'
        ];

        for (const sql of indexes) {
            try {
                await db.execute(sql);
            } catch (e) {
                console.log(`Warning: Failed to create index: ${e.message}`);
            }
        }

        console.log('✅ Migration completed successfully!');
    } catch (e) {
        console.error('❌ Error during migration:', e);
        process.exit(1);
    }
}

main();
