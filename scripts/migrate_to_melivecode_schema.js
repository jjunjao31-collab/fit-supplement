const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function migrate() {
  console.log('Connecting to MySQL on 127.0.0.1:3306...');
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'fitsupp'
  });

  console.log('Connected to fitsupp database. Starting migration to Melivecode schema...');

  // 1. Generate real bcrypt hashes (Melivecode Article 04: "ห้ามเก็บรหัสผ่านจริง เก็บเฉพาะ bcrypt hash")
  const userPasswordHash = await bcrypt.hash('user1234', 10);
  const adminPasswordHash = await bcrypt.hash('admin1234', 10);

  // 2. Rename columns to match Melivecode DIT205 exact naming:
  // fullName -> fullname
  // createdAt -> created_at
  const [userCols] = await conn.query('DESCRIBE users');
  const userColNames = userCols.map(c => c.Field);

  if (userColNames.includes('fullName')) {
    console.log("Renaming column `fullName` to `fullname` (Melivecode standard)...");
    await conn.query('ALTER TABLE users CHANGE COLUMN fullName fullname VARCHAR(255) NOT NULL');
  }

  if (userColNames.includes('createdAt')) {
    console.log("Renaming column `createdAt` to `created_at` (Melivecode standard)...");
    await conn.query('ALTER TABLE users CHANGE COLUMN createdAt created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  }

  // 3. Update existing user 1 with bcrypt hash & email
  await conn.query(
    `UPDATE users 
     SET password = ?, fullname = 'คุณสมชาย ใจดี (สมาชิกทั่วไป)', email = 'somchai@example.com', role = 'member'
     WHERE id = 1 OR username = 'user'`,
    [userPasswordHash]
  );
  console.log('Updated user 1 password to real bcrypt hash ($2b$10$...)!');

  // 4. Ensure admin exists in `users` table with role='admin' and bcrypt hash
  const [adminInUsers] = await conn.query("SELECT id FROM users WHERE username = 'admin' OR email = 'admin@fitsupp.com'");
  if (adminInUsers.length === 0) {
    console.log('Inserting admin into `users` table (Melivecode DIT205 RBAC style)...');
    await conn.query(
      `INSERT INTO users (username, email, password, fullname, role, phone, address, points)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'admin',
        'admin@fitsupp.com',
        adminPasswordHash,
        'ผู้ดูแลระบบ FIT SUPPLEMENT (Admin)',
        'admin',
        '02-123-4567',
        'สำนักงานใหญ่ FIT SUPPLEMENT กรุงเทพฯ',
        999
      ]
    );
  } else {
    console.log('Updating admin in `users` table with bcrypt hash...');
    await conn.query(
      `UPDATE users 
       SET password = ?, fullname = 'ผู้ดูแลระบบ FIT SUPPLEMENT (Admin)', role = 'admin'
       WHERE username = 'admin' OR email = 'admin@fitsupp.com'`,
      [adminPasswordHash]
    );
  }

  // Also update `admins` table with bcrypt hash if admins table exists
  try {
    await conn.query(
      `UPDATE admins SET password = ? WHERE username = 'admin'`,
      [adminPasswordHash]
    );
    console.log('Updated `admins` table with bcrypt hash as well.');
  } catch (e) {}

  // 5. Update `products` table with Melivecode columns (stock, detail, created_at)
  const [prodCols] = await conn.query('DESCRIBE products');
  const prodColNames = prodCols.map(c => c.Field);

  if (!prodColNames.includes('stock')) {
    console.log("Adding column `stock` to `products`...");
    await conn.query('ALTER TABLE products ADD COLUMN stock INT DEFAULT 50 AFTER price');
    await conn.query('UPDATE products SET stock = CASE WHEN inStock = 1 THEN 50 ELSE 0 END');
  }

  if (!prodColNames.includes('detail')) {
    console.log("Adding column `detail` to `products`...");
    await conn.query('ALTER TABLE products ADD COLUMN detail TEXT NULL AFTER stock');
    await conn.query('UPDATE products SET detail = suitableFor WHERE suitableFor IS NOT NULL');
  }

  if (!prodColNames.includes('created_at')) {
    console.log("Adding column `created_at` to `products`...");
    await conn.query('ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  }

  // 6. Check resulting users table
  const [finalUsers] = await conn.query('SELECT id, email, password, fullname, role, username FROM users');
  console.log('\n=== Final `users` Table in MySQL (Melivecode Schema) ===');
  console.table(finalUsers);

  await conn.end();
  console.log('\nMigration to Melivecode schema finished successfully!');
}

migrate().catch(console.error);
