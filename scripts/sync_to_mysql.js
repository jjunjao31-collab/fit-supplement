const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function sync() {
  console.log('Connecting to MySQL on 127.0.0.1:3306...');
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: ''
  });

  // 1. Create database fitsupp
  await conn.query('CREATE DATABASE IF NOT EXISTS fitsupp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
  await conn.query('USE fitsupp;');
  console.log('Database `fitsupp` selected.');

  // 2. Create tables
  await conn.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      fullName VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      fullName VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      address TEXT,
      role VARCHAR(50) DEFAULT 'member',
      points INT DEFAULT 150,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      nameTH VARCHAR(255) NOT NULL,
      brand VARCHAR(100) NOT NULL,
      category VARCHAR(100) NOT NULL,
      subCategory VARCHAR(100),
      price DECIMAL(10, 2) NOT NULL,
      originalPrice DECIMAL(10, 2),
      fdaNumber VARCHAR(100) NOT NULL,
      rating DECIMAL(3, 1) DEFAULT 5.0,
      reviewsCount INT DEFAULT 0,
      servings VARCHAR(100),
      size VARCHAR(100),
      suitableFor TEXT,
      howToUse TEXT,
      goal VARCHAR(100),
      badge VARCHAR(100),
      inStock INT DEFAULT 1,
      imageUrl VARCHAR(255),
      features JSON
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(100) PRIMARY KEY,
      userId INT,
      customerName VARCHAR(255) NOT NULL,
      customerPhone VARCHAR(50) NOT NULL,
      customerAddress TEXT NOT NULL,
      items JSON NOT NULL,
      totalAmount DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Tables created in MySQL: admins, users, products, orders.');

  // 3. Read data from SQLite
  const sqliteDb = new sqlite3.Database(path.join(__dirname, '..', 'data', 'fitsupp.db'));

  const getSqliteData = (table) => {
    return new Promise((resolve, reject) => {
      sqliteDb.all(`SELECT * FROM ${table}`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  };

  const admins = await getSqliteData('admins');
  const users = await getSqliteData('users');
  const products = await getSqliteData('products');
  const orders = await getSqliteData('orders');

  console.log(`SQLite records: admins=${admins.length}, users=${users.length}, products=${products.length}, orders=${orders.length}`);

  // Populate Admins
  for (const a of admins) {
    await conn.query(
      `INSERT INTO admins (id, username, password, fullName, role, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE fullName = VALUES(fullName), password = VALUES(password);`,
      [a.id, a.username, a.password, a.fullName, a.role, a.createdAt || new Date()]
    );
  }

  // Populate Users
  for (const u of users) {
    await conn.query(
      `INSERT INTO users (id, username, password, fullName, email, phone, address, role, points, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE fullName = VALUES(fullName), address = VALUES(address), phone = VALUES(phone), points = VALUES(points);`,
      [u.id, u.username, u.password, u.fullName, u.email, u.phone, u.address, u.role, u.points, u.createdAt || new Date()]
    );
  }

  // Populate Products
  for (const p of products) {
    let featuresVal = p.features;
    if (typeof featuresVal === 'string') {
      try {
        featuresVal = JSON.stringify(JSON.parse(featuresVal));
      } catch (e) {
        featuresVal = JSON.stringify([]);
      }
    } else {
      featuresVal = JSON.stringify(featuresVal || []);
    }

    await conn.query(
      `INSERT INTO products (
        id, name, nameTH, brand, category, subCategory, price, originalPrice,
        fdaNumber, rating, reviewsCount, servings, size, suitableFor, howToUse,
        goal, badge, inStock, imageUrl, features
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name), price = VALUES(price), inStock = VALUES(inStock), imageUrl = VALUES(imageUrl);`,
      [
        p.id, p.name, p.nameTH, p.brand, p.category, p.subCategory, p.price, p.originalPrice,
        p.fdaNumber, p.rating, p.reviewsCount, p.servings, p.size, p.suitableFor, p.howToUse,
        p.goal, p.badge, p.inStock, p.imageUrl, featuresVal
      ]
    );
  }

  // Populate Orders
  for (const o of orders) {
    let itemsVal = o.items;
    if (typeof itemsVal === 'string') {
      try {
        itemsVal = JSON.stringify(JSON.parse(itemsVal));
      } catch (e) {
        itemsVal = JSON.stringify([]);
      }
    } else {
      itemsVal = JSON.stringify(itemsVal || []);
    }

    await conn.query(
      `INSERT INTO orders (id, userId, customerName, customerPhone, customerAddress, items, totalAmount, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), customerAddress = VALUES(customerAddress);`,
      [
        o.id, o.userId || null, o.customerName, o.customerPhone, o.customerAddress,
        itemsVal, o.totalAmount, o.status, o.createdAt || new Date()
      ]
    );
  }

  console.log('Successfully synced all data into MySQL database `fitsupp`!');
  await conn.end();
  sqliteDb.close();
}

sync().catch(console.error);
