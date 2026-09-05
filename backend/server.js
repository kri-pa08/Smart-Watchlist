const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDB, getDB } = require('./db');
const { getStockPrice } = require('./stockService');
const watchlistRoutes = require('./watchlistRoutes');
const alertRoutes = require('./alertRoutes');
const { startMonitoring } = require('./monitorService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Watchlist routes
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/alerts', alertRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running'
  });
});

// Stock price route
app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const data = await getStockPrice(req.params.symbol);
    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.get('/api/watchlist/prices', async (req, res) => {
  try {
    const db = getDB();

    const stocks = await db.all(`
      SELECT stock_symbol
      FROM watchlist_items
      ORDER BY added_at DESC
    `);

    const results = [];

    for (const stock of stocks) {
      const data = await getStockPrice(stock.stock_symbol);
      results.push(data);
    }

    res.json(results);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Initialize database and start server
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    startMonitoring();
  })
  .catch((err) => {
    console.error('Database initialization failed:', err);
  });