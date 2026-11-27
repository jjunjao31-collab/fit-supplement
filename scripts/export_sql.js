const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function dumpSQL() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'fitsupp'
  });

  let sqlOutput = '-- FIT SUPPLEMENT Database Dump for phpMyAdmin / MySQL\n';
  sqlOutput += '-- Database: fitsupp\n\n';
  sqlOutput += 'CREATE DATABASE IF NOT EXISTS `fitsupp` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n';
  sqlOutput += 'USE `fitsupp`;\n\n';

  const tables = ['users', 'products', 'orders'];

  for (const table of tables) {
    const [createTableResult] = await conn.query('SHOW CREATE TABLE `' + table + '`');
    sqlOutput += '-- --------------------------------------------------------\n';
    sqlOutput += '-- โครงสร้างตาราง: `' + table + '`\n';
    sqlOutput += '-- --------------------------------------------------------\n';
    sqlOutput += 'DROP TABLE IF EXISTS `' + table + '`;\n';
    sqlOutput += createTableResult[0]['Create Table'] + ';\n\n';

    const [rows] = await conn.query('SELECT * FROM `' + table + '`');
    if (rows.length > 0) {
      sqlOutput += '-- ข้อมูลสำหรับตาราง `' + table + '`\n';
      for (const row of rows) {
        const keys = Object.keys(row).map(k => '`' + k + '`').join(', ');
        const values = Object.values(row).map(v => {
          if (v === null) return 'NULL';
          if (typeof v === 'number') return v;
          if (v instanceof Date) return conn.escape(v.toISOString().slice(0, 19).replace('T', ' '));
          if (typeof v === 'object') return conn.escape(JSON.stringify(v));
          return conn.escape(v);
        }).join(', ');
        sqlOutput += 'INSERT INTO `' + table + '` (' + keys + ') VALUES (' + values + ');\n';
      }
      sqlOutput += '\n';
    }
  }

  const outPath = path.join(__dirname, '..', 'data', 'fitsupp.sql');
  fs.writeFileSync(outPath, sqlOutput, 'utf8');
  console.log('Successfully written fitsupp.sql at:', outPath);
  await conn.end();
}

dumpSQL().catch(console.error);
