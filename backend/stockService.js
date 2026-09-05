const { getDB } = require('./db');
const { checkPriceAlert } = require('./alertService');

const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

const CACHE_DURATION_MS = 2 * 60 * 1000;

async function getStockPrice(symbol) {
  const db = getDB();

  const lastRecord = await db.get(
    `SELECT * FROM price_history
     WHERE stock_symbol = ?
     ORDER BY fetched_at DESC
     LIMIT 1`,
    [symbol]
  );

  const now = new Date();

  // Cache HIT
  if (lastRecord) {
    const lastFetchedTime = new Date(
      lastRecord.fetched_at.replace(' ', 'T') + 'Z'
    );

    const ageMs = now - lastFetchedTime;

    if (ageMs < CACHE_DURATION_MS) {
      console.log(`Cache HIT for ${symbol}`);

      return {
        symbol,
        price: lastRecord.price,
        fetched_at: lastRecord.fetched_at,
        source: 'cache',
        alert: null
      };
    }
  }

  // Cache MISS
  console.log(`Cache MISS for ${symbol} — calling Yahoo Finance`);

  try {
    const quote = await yahooFinance.quote(symbol);
    const price = quote.regularMarketPrice;

    if (!price) {
      throw new Error('Price not found in response');
    }

    // Compare OLD price with NEW price
    let alert = null;

    if (lastRecord) {
      alert = checkPriceAlert(
        symbol,
        lastRecord.price,
        price
      );
    }

 if (alert) {
  const recentAlert = await db.get(
    `SELECT *
     FROM alerts
     WHERE stock_symbol = ?
     AND alert_type = ?
     AND created_at >= datetime('now', '-10 minutes')
     ORDER BY created_at DESC
     LIMIT 1`,
    [alert.symbol, alert.alertLevel]
  );

  if (recentAlert) {
    console.log(`Duplicate alert skipped for ${symbol}`);
  } else {
    await db.run(
      `INSERT INTO alerts (
        stock_symbol,
        alert_type,
        message,
        percentage_change,
        previous_price,
        current_price
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        alert.symbol,
        alert.alertLevel,
        alert.message,
        alert.percentageChange,
        alert.previousPrice,
        alert.currentPrice
      ]
    );

    console.log(`Alert saved for ${symbol}`);
  }
}

    // Save NEW price
    await db.run(
      `INSERT INTO price_history (stock_symbol, price)
       VALUES (?, ?)`,
      [symbol, price]
    );

    return {
      symbol,
      price,
      fetched_at: new Date().toISOString(),
      source: 'api',
      alert
    };

  } catch (err) {
  console.log(" YAHOO ERROR:", err);
  console.log(`API failed for ${symbol}: ${err.message}`);

    if (lastRecord) {
      return {
        symbol,
        price: lastRecord.price,
        fetched_at: lastRecord.fetched_at,
        source: 'stale_cache',
        alert: null
      };
    }

    throw new Error('Price not available');
  }
}

module.exports = { getStockPrice };