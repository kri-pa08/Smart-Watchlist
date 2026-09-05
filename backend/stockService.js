const { getDB } = require('./db');
const { checkPriceAlert } = require('./alertService');
const {
  detectAnomaly,
  calculateAverageMovement
} = require('./anomalyService');
const { generateMovementReason } = require('./reasonService');
const { detectMeaningfulChanges } = require('./changeService');
const { getStockNews } = require('./newsService');
const { classifyNewsImportance } = require('./aiService');

const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

//const CACHE_DURATION_MS = 2 * 60 * 1000;
//const CACHE_DURATION_MS = 0;
const CACHE_DURATION_MS = 999999999;
console.log("NEW STOCK SERVICE LOADED");

async function getStockPrice(symbol) {

  console.log("CALL:", symbol, Date.now());

  const db = getDB();

  const lastRecord = await db.get(
    `SELECT * FROM price_history
     WHERE stock_symbol = ?
     ORDER BY fetched_at DESC
     LIMIT 1`,
    [symbol]
  );

  const now = new Date();

  // =========================
  // CACHE HIT
  // =========================
  if (lastRecord) {
    const lastFetchedTime = new Date(
      lastRecord.fetched_at.replace(' ', 'T') + 'Z'
    );

    const ageMs = now - lastFetchedTime;

    if (ageMs < CACHE_DURATION_MS) {
  console.log(`Cache HIT for ${symbol}`);

  let cachedNews = [];

  try {
    cachedNews = await getStockNews(symbol);

    cachedNews = cachedNews.map(item => ({
      ...item,
      importance: classifyNewsImportance(item.title)
    }));

    console.log(
      `NEWS FOR ${symbol}: ${cachedNews.length} articles`
    );
  } catch (err) {
    console.log(
      `News unavailable for ${symbol}: ${err.message}`
    );
  }

  const cachedReason = generateMovementReason({
    changePercentage: 0,
    anomalyLevel: "NORMAL",
    volumeStatus: "NORMAL",
    volumeRatio: 0,
    news: cachedNews
  });

  return {
    symbol,
    price: lastRecord.price,
    fetched_at: lastRecord.fetched_at,
    source: 'cache',
    alert: null,

    anomaly: {
      changePercentage: 0,
      anomalyLevel: "NORMAL",
      averageMovement: 0
    },

    volume: {
      current: lastRecord.volume || 0,
      average: 0,
      ratio: 0,
      status: "NORMAL"
    },

    whyDidItMove: cachedReason,

    meaningfulChanges: {
      hasMeaningfulChange: false,
      overallImportance: "LOW",
      priceChangePercentage: 0,
      changes: []
    }
  };
}
  }
  // =========================
  // CACHE MISS
  // =========================
  console.log(`Cache MISS for ${symbol} — calling Yahoo Finance`);

  try {
    const quote = await yahooFinance.quote(symbol);

    const price = quote.regularMarketPrice;
    const volume = quote.regularMarketVolume || 0;

    if (!price) {
      throw new Error('Price not found in response');
    }

    // =========================
    // PRICE ALERT
    // =========================
    let alert = null;

    if (lastRecord) {
      alert = checkPriceAlert(
        symbol,
        lastRecord.price,
        price
      );
    }

    // =========================
    // ANOMALY
    // =========================
    let anomaly = {
      changePercentage: 0,
      anomalyLevel: "NORMAL",
      averageMovement: 0
    };

    // =========================
    // VOLUME VARIABLES
    // IMPORTANT:
    // Declare them BEFORE using them
    // =========================
    let averageVolume = 0;
    let volumeRatio = 0;
    let volumeStatus = "NORMAL";

    if (lastRecord) {

      // -------------------------
      // Recent prices
      // -------------------------
      const recentPrices = await db.all(
        `SELECT price
         FROM price_history
         WHERE stock_symbol = ?
         ORDER BY fetched_at DESC
         LIMIT 10`,
        [symbol]
      );

      const averageMovement =
        calculateAverageMovement(
          recentPrices.reverse()
        );

      anomaly = detectAnomaly(
        lastRecord.price,
        price,
        averageMovement
      );

      anomaly.averageMovement = averageMovement;


      // -------------------------
      // Recent volumes
      // -------------------------
      const recentVolumes = await db.all(
        `SELECT volume
         FROM price_history
         WHERE stock_symbol = ?
         AND volume IS NOT NULL
         AND volume > 0
         ORDER BY fetched_at DESC
         LIMIT 10`,
        [symbol]
      );

      if (recentVolumes.length > 0) {

        const totalVolume = recentVolumes.reduce(
          (sum, item) => sum + (item.volume || 0),
          0
        );

        averageVolume =
          totalVolume / recentVolumes.length;
      }


      // -------------------------
      // Volume ratio
      // -------------------------
      if (averageVolume > 0 && volume > 0) {

        volumeRatio =
          volume / averageVolume;

        if (volumeRatio >= 3) {
          volumeStatus = "HIGH";
        } else if (volumeRatio >= 2) {
          volumeStatus = "MEDIUM";
        }
      }
    }
    // =========================
// NEWS
// =========================

let news = [];

try {
  news = await getStockNews(symbol);

  news = news.map(item => ({
    ...item,
    importance: classifyNewsImportance(item.title)
  }));

  console.log(`NEWS FOR ${symbol}: ${news.length} articles`);
} catch (err) {
  console.log(`News unavailable for ${symbol}: ${err.message}`);
}

    // =========================
    // WHY DID IT MOVE?
    // =========================
    
    const movementReason = generateMovementReason({
      changePercentage: anomaly.changePercentage,
      anomalyLevel: anomaly.anomalyLevel,
      volumeStatus,
      volumeRatio,
      news
    });
    const meaningfulChanges = detectMeaningfulChanges({
  previousPrice: lastRecord ? lastRecord.price : 0,
  currentPrice: price,
  previousVolume: lastRecord ? (lastRecord.volume || 0) : 0,
  currentVolume: volume,
  anomalyLevel: anomaly.anomalyLevel,
  volumeStatus
});

    // =========================
    // SAVE ALERT
    // =========================
    if (alert) {

      const recentAlert = await db.get(
        `SELECT *
         FROM alerts
         WHERE stock_symbol = ?
         AND alert_type = ?
         AND created_at >= datetime('now', '-10 minutes')
         ORDER BY created_at DESC
         LIMIT 1`,
        [
          alert.symbol,
          alert.alertLevel
        ]
      );

      if (recentAlert) {

        console.log(
          `Duplicate alert skipped for ${symbol}`
        );

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

        console.log(
          `Alert saved for ${symbol}`
        );
      }
    }

    // =========================
    // SAVE PRICE + VOLUME
    // =========================
    await db.run(
      `INSERT INTO price_history (
        stock_symbol,
        price,
        change_percentage,
        anomaly_level,
        volume
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        symbol,
        price,
        anomaly.changePercentage,
        anomaly.anomalyLevel,
        volume
      ]
    );

    // =========================
    // FINAL RESPONSE
    // =========================
    return {
      symbol,
      price,
      fetched_at: new Date().toISOString(),
      source: 'api',

      alert,

      anomaly,

  volume: {
  current: volume,
  average: Number(averageVolume.toFixed(0)),
  ratio: Number(volumeRatio.toFixed(2)),
  status: volumeStatus
},

whyDidItMove: movementReason,

meaningfulChanges
};

  } catch (err) {

    console.log(
      "YAHOO ERROR:",
      err
    );

    console.log(
      `API failed for ${symbol}: ${err.message}`
    );

    if (lastRecord) {

      return {
        symbol,
        price: lastRecord.price,
        fetched_at: lastRecord.fetched_at,
        source: 'stale_cache',
        alert: null
      };
    }

    throw new Error(
      'Price not available'
    );
  }
}

module.exports = {
  getStockPrice
};