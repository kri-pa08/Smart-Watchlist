const HIGH_ALERT_THRESHOLD = 2; // 2%

function checkPriceAlert(symbol, previousPrice, currentPrice) {
  if (!previousPrice) {
    return null;
  }

  const percentageChange =
    ((currentPrice - previousPrice) / previousPrice) * 100;

  const absoluteChange = Math.abs(percentageChange);

  if (absoluteChange < HIGH_ALERT_THRESHOLD) {
    return null;
  }

  const direction = percentageChange > 0 ? 'increased' : 'decreased';

  return {
    symbol,
    previousPrice,
    currentPrice,
    percentageChange: Number(percentageChange.toFixed(2)),
    direction,
    alertLevel: 'HIGH',
    message: `${symbol} ${direction} by ${absoluteChange.toFixed(2)}%`
  };
}

module.exports = { checkPriceAlert };