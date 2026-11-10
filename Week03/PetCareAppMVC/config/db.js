const mysql = require('mysql2');

// MySQL pool: do not open a database connection during app startup.
// This keeps the mock payment endpoint usable without requiring a live
// database connection for every classroom route.
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'SoiDft2026',
  database: 'petcare',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
