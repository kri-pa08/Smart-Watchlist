function detectAnomaly(previousPrice, currentPrice, averageMovement = 0) {
  if (!previousPrice || !currentPrice) {
    return {
      changePercentage: 0,
      anomalyLevel: "NORMAL",
      deviationRatio: 0
    };
  }

  const changePercentage =
    ((currentPrice - previousPrice) / previousPrice) * 100;

  const absoluteChange = Math.abs(changePercentage);

  let anomalyLevel = "NORMAL";
  let deviationRatio = 0;

  // If historical baseline is available
  if (averageMovement > 0) {
    deviationRatio = absoluteChange / averageMovement;

    if (deviationRatio >= 3) {
      anomalyLevel = "HIGH";
    } else if (deviationRatio >= 2) {
      anomalyLevel = "MEDIUM";
    }
  } else {
    // Fallback when there is not enough historical data
    if (absoluteChange >= 5) {
      anomalyLevel = "HIGH";
    } else if (absoluteChange >= 3) {
      anomalyLevel = "MEDIUM";
    }
  }

  return {
    changePercentage: Number(changePercentage.toFixed(2)),
    anomalyLevel,
    deviationRatio: Number(deviationRatio.toFixed(2))
  };
}


function calculateAverageMovement(priceHistory) {
  if (!priceHistory || priceHistory.length < 2) {
    return 0;
  }

  let totalMovement = 0;
  let count = 0;

  for (let i = 1; i < priceHistory.length; i++) {
    const previous = priceHistory[i - 1].price;
    const current = priceHistory[i].price;

    if (!previous || !current) {
      continue;
    }

    const movement =
      Math.abs(((current - previous) / previous) * 100);

    totalMovement += movement;
    count++;
  }

  if (count === 0) {
    return 0;
  }

  return Number((totalMovement / count).toFixed(2));
}


module.exports = {
  detectAnomaly,
  calculateAverageMovement
};