const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    try {
        const migrationPath = path.join(__dirname, 'src', 'db', 'migrations', '02_add_challenge_deadlines.sql');
        const migration = await fs.readFile(migrationPath, 'utf8');
        
        await pool.query(migration);
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run the migration
require('dotenv').config();
runMigration();