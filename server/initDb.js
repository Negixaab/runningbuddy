const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    try {
        // Read the schema file
        const schemaPath = path.join(__dirname, 'src', 'db', 'schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        // Execute the schema
        await pool.query(schema);
        
        // Insert some sample challenges
        await pool.query(`
            INSERT INTO challenges (title, description, type, goal_value, goal_unit) 
            VALUES 
                ('Daily 5K', 'Run 5 kilometers today', 'distance', 5.0, 'km'),
                ('30 Minute Run', 'Run for 30 minutes today', 'duration', 1800, 'seconds')
            ON CONFLICT DO NOTHING;
        `);

        console.log('Database initialized successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}