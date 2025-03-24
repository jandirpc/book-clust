const mysql = require('mysql2/promise');
require('dotenv').config();


let connection;

async function conectarBD() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
  }
  return connection;
}

module.exports = conectarBD;
