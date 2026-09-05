const express = require('express');
const router = express.Router();

const { getDB } = require('./db');

// GET all watchlist stocks
router.get('/', async (req, res) => {
  try {
    const db = getDB();

    const stocks = await db.all(`
      SELECT * FROM watchlist_items
      ORDER BY added_at DESC
    `);

    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD stock to watchlist
router.post('/', async (req, res) => {
  try {
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({
        error: 'Stock symbol is required'
      });
    }

    const db = getDB();

    await db.run(
      `INSERT INTO watchlist_items (stock_symbol)
       VALUES (?)`,
      [symbol.toUpperCase()]
    );

    res.json({
      message: 'Stock added to watchlist',
      symbol: symbol.toUpperCase()
    });

  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({
        error: 'Stock already exists in watchlist'
      });
    }

    res.status(500).json({
      error: err.message
    });
  }
});

// DELETE stock from watchlist
router.delete('/:symbol', async (req, res) => {
  try {
    const db = getDB();

    const symbol = req.params.symbol.toUpperCase();

    const result = await db.run(
      `DELETE FROM watchlist_items
       WHERE stock_symbol = ?`,
      [symbol]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        error: 'Stock not found in watchlist'
      });
    }

    res.json({
      message: 'Stock removed from watchlist',
      symbol
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});
// GET what changed since user's last check
router.get('/changes', async (req, res) => {
  try {
    const db = getDB();

    const stocks = await db.all(`
      SELECT
        stock_symbol,
        price,
        change_percentage,
        anomaly_level,
        volume,
        fetched_at
      FROM price_history
      WHERE id IN (
        SELECT MAX(id)
        FROM price_history
        GROUP BY stock_symbol
      )
      ORDER BY fetched_at DESC
    `);

    const changes = stocks.map(stock => {
      const change = stock.change_percentage || 0;

      return {
        symbol: stock.stock_symbol,
        price: stock.price,
        changePercentage: Number(change.toFixed(2)),
        anomaly: stock.anomaly_level || "NORMAL",
        volume: stock.volume || 0,
        fetchedAt: stock.fetched_at,

        attention:
          Math.abs(change) >= 5
            ? "HIGH"
            : Math.abs(change) >= 2
              ? "MEDIUM"
              : "LOW",

        message:
          Math.abs(change) >= 5
            ? `${stock.stock_symbol} moved significantly since your last check`
            : Math.abs(change) >= 2
              ? `${stock.stock_symbol} showed a noticeable movement`
              : `${stock.stock_symbol} has no major change`
      };
    });

    res.json({
      count: changes.length,
      changes
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;
