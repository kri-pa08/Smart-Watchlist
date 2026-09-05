function detectMeaningfulChanges({
  previousPrice = 0,
  currentPrice = 0,
  previousVolume = 0,
  currentVolume = 0,
  anomalyLevel = "NORMAL",
  volumeStatus = "NORMAL"
}) {
  const changes = [];

  // Price change
  let priceChangePercentage = 0;

  if (previousPrice > 0 && currentPrice > 0) {
    priceChangePercentage =
      ((currentPrice - previousPrice) / previousPrice) * 100;
  }

  const absolutePriceChange =
    Math.abs(priceChangePercentage);

  if (absolutePriceChange >= 5) {
    changes.push({
      type: "PRICE",
      importance: "HIGH",
      message: `Price moved ${priceChangePercentage.toFixed(2)}%`
    });
  } else if (absolutePriceChange >= 2) {
    changes.push({
      type: "PRICE",
      importance: "MEDIUM",
      message: `Price moved ${priceChangePercentage.toFixed(2)}%`
    });
  }

  // Volume change
  let volumeRatio = 0;

  if (previousVolume > 0 && currentVolume > 0) {
    volumeRatio = currentVolume / previousVolume;
  }

  if (volumeStatus === "HIGH") {
    changes.push({
      type: "VOLUME",
      importance: "HIGH",
      message: `Trading volume is ${volumeRatio.toFixed(2)}× the previous recorded volume`
    });
  } else if (volumeStatus === "MEDIUM") {
    changes.push({
      type: "VOLUME",
      importance: "MEDIUM",
      message: `Trading volume is ${volumeRatio.toFixed(2)}× the previous recorded volume`
    });
  }

  // Anomaly
  if (anomalyLevel === "HIGH") {
    changes.push({
      type: "ANOMALY",
      importance: "HIGH",
      message: "Unusual price movement detected"
    });
  } else if (anomalyLevel === "MEDIUM") {
    changes.push({
      type: "ANOMALY",
      importance: "MEDIUM",
      message: "Price movement is above its normal range"
    });
  }

  // Overall importance
  let overallImportance = "LOW";

  if (
    changes.some(change => change.importance === "HIGH")
  ) {
    overallImportance = "HIGH";
  } else if (
    changes.some(change => change.importance === "MEDIUM")
  ) {
    overallImportance = "MEDIUM";
  }

  return {
    hasMeaningfulChange: changes.length > 0,
    overallImportance,
    priceChangePercentage: Number(
      priceChangePercentage.toFixed(2)
    ),
    changes
  };
}

module.exports = {
  detectMeaningfulChanges
};