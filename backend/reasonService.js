function generateMovementReason({
  changePercentage = 0,
  anomalyLevel = "NORMAL",
  volumeStatus = "NORMAL",
  volumeRatio = 0,
  news = []
}) {
  const reasons = [];
  const absChange = Math.abs(changePercentage);

  if (absChange >= 5) {
    reasons.push("Very strong price movement detected");
  } else if (absChange >= 3) {
    reasons.push("Significant price movement detected");
  } else if (absChange >= 2) {
    reasons.push("Moderate price movement detected");
  }

  if (anomalyLevel === "HIGH") {
    reasons.push("Price movement is unusually high compared with historical movement");
  } else if (anomalyLevel === "MEDIUM") {
    reasons.push("Price movement is above the normal historical range");
  }

  if (volumeStatus === "HIGH") {
    reasons.push(`Trading volume is unusually high (${volumeRatio.toFixed(2)}× normal)`);
  } else if (volumeStatus === "MEDIUM") {
    reasons.push(`Trading volume is above normal (${volumeRatio.toFixed(2)}× normal)`);
  }

  const importantNews = news.filter(item => item.importance === "HIGH");
  if (importantNews.length > 0) {
    reasons.push(`${importantNews.length} high-importance news event(s) detected`);
  }

  let explanation = "No strong catalyst detected yet.";
  if (reasons.length > 0) {
    if (changePercentage > 0) {
      explanation = "The stock is showing upward movement with supporting market signals.";
    } else if (changePercentage < 0) {
      explanation = "The stock is showing downward movement with supporting market signals.";
    } else {
      explanation = "Important market signals were detected, but there is no significant price movement yet.";
    }
  }

  return {
    direction: changePercentage > 0 ? "UP" : changePercentage < 0 ? "DOWN" : "FLAT",
    changePercentage: Number(changePercentage.toFixed(2)),
    explanation,
    reasons
  };
}

module.exports = { generateMovementReason };