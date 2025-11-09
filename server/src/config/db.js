// This file configures the connection to the PostgreSQL database using the 'pg' library.

const { Pool } = require('pg');

// Create a new connection pool with explicit configuration
const pool = new Pool({
    user: 'postgres',
    password: 'shishir@26',
    host: 'localhost',
    port: 5432,
    database: 'runsphere_db',
    // Add error handling
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait for a connection
});// Export the pool so it can be used by other parts of the application to query the database.
module.exports = pool;
