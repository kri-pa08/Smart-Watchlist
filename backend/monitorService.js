const { getDB } = require('./db');
const { getStockPrice } = require('./stockService');

const MONITOR_INTERVAL = 2 * 60 * 1000; // 2 minutes

async function monitorWatchlist() {
  try {
    const db = getDB();

    const stocks = await db.all(`
      SELECT stock_symbol
      FROM watchlist_items
    `);

    if (stocks.length === 0) {
      console.log('Monitor: Watchlist is empty');
      return;
    }

    console.log('Monitor: Checking watchlist...');

    for (const stock of stocks) {
      try {
        const result = await getStockPrice(stock.stock_symbol);

        if (result.alert) {
          console.log(
            `🚨 ALERT: ${result.alert.message}`
          );
        } else {
          console.log(
            `✓ ${stock.stock_symbol}: ₹${result.price}`
          );
        }

      } catch (err) {
        console.log(
          `Monitor failed for ${stock.stock_symbol}: ${err.message}`
        );
      }
    }

  } catch (err) {
    console.log(
      `Monitor error: ${err.message}`
    );
  }
}

function startMonitoring() {
  console.log('Automatic monitoring started');

  monitorWatchlist();

  setInterval(
    monitorWatchlist,
    MONITOR_INTERVAL
  );
}

module.exports = {
  startMonitoring
};