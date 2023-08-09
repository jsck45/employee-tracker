const mysql = require('mysql2');

// Connect to the database and export the connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'abc123',
    database: 'employee_db',
  });

module.exports = db;
