const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

let db;

async function initDB() {
  db = await open({
    filename: './watchlist.db',
    driver: sqlite3.Database
  });

  // Watchlist items table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS watchlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stock_symbol TEXT NOT NULL UNIQUE,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Price history table — yeh important hai "change" detect karne ke liye
  await db.exec(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stock_symbol TEXT NOT NULL,
      price REAL NOT NULL,
      fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.run(`
  ALTER TABLE price_history
  ADD COLUMN change_percentage REAL
`).catch(() => {});

await db.run(`
  ALTER TABLE price_history
  ADD COLUMN anomaly_level TEXT
`).catch(() => {});
  await db.exec(`
  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stock_symbol TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    message TEXT NOT NULL,
    percentage_change REAL,
    previous_price REAL,
    current_price REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read INTEGER DEFAULT 0
  )
`);
await db.exec(`
  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stock_symbol TEXT NOT NULL,
    title TEXT NOT NULL,
    link TEXT UNIQUE,
    source TEXT,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

  console.log('Database initialized');
  return db;
}

function getDB() {
  return db;
}

module.exports = { initDB, getDB };