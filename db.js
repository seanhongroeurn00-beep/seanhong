const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '192.168.100.135', // 🛠️ Crucial change: Point this directly to your database machine IP
    user: 'hong_admin',      // Make sure this matches your created credentials
    password: 'admin123',    
    database: 'db_admin',    // Double check your exact database name syntax string
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();