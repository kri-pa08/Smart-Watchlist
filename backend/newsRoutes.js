const express = require('express');
const router = express.Router();

const { getDB } = require('./db');
const { getStockNews } = require('./newsService');
const {
  summarizeNews,
  classifyNewsImportance,
  detectSignalOrNoise
} = require('./aiService');

// GET news for a stock
router.get('/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const news = await getStockNews(symbol);

    res.json({
      symbol,
      count: news.length,
      news
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});
// GET stored news from database
router.get('/:symbol/stored', async (req, res) => {
  try {
    const db = getDB();
    const symbol = req.params.symbol.toUpperCase();

    const news = await db.all(
      `SELECT *
       FROM news
       WHERE stock_symbol = ?
       ORDER BY published_at DESC
       LIMIT 20`,
      [symbol]
    );

 for (const item of news) {
  item.summary = "News summary available";
  item.importance = classifyNewsImportance(item.title);
  item.signalType = detectSignalOrNoise(item.title);
}
    res.json({
      symbol,
      count: news.length,
      news
    });

  } catch (err) {
    console.log("Stored news error:", err.message);

    res.status(500).json({
      error: err.message
    });
  }
});
module.exports = router;