function summarizeNews(title) {
  const lowerTitle = title.toLowerCase();

  let summary = "";

  if (
    lowerTitle.includes("fall") ||
    lowerTitle.includes("decline") ||
    lowerTitle.includes("slip")
  ) {
    summary =
      "The stock is facing downward pressure based on the reported development. Investors may want to monitor whether the weakness continues.";
  } 
  else if (
    lowerTitle.includes("rallies") ||
    lowerTitle.includes("rise") ||
    lowerTitle.includes("higher") ||
    lowerTitle.includes("upside")
  ) {
    summary =
      "The news indicates positive movement or expectations around the company. Investors may want to monitor whether the positive trend continues.";
  } 
  else if (
    lowerTitle.includes("dividend") ||
    lowerTitle.includes("bonus") ||
    lowerTitle.includes("split")
  ) {
    summary =
      "The news relates to a corporate action involving the company. Such announcements can affect investor interest and the stock's trading activity.";
  } 
  else {
    summary =
      "This news concerns the company and may be relevant to its business or stock performance. Investors should review the source for the full context.";
  }

  return summary;
}
function classifyNewsImportance(title) {
  const lowerTitle = title.toLowerCase();

  const highKeywords = [
    "acquisition",
    "merger",
    "earnings",
    "profit",
    "loss",
    "fraud",
    "investigation",
    "regulatory",
    "resignation",
    "ceo",
    "lawsuit",
    "ban",
    "downgrade",
    "upgrade"
  ];

  const mediumKeywords = [
    "dividend",
    "bonus",
    "stock split",
    "investment",
    "expansion",
    "partnership",
    "contract",
    "target",
    "outlook"
  ];

  if (highKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return "HIGH";
  }

  if (mediumKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return "MEDIUM";
  }

  return "LOW";
}
function detectSignalOrNoise(title) {
  const lowerTitle = title.toLowerCase();

  const signalKeywords = [
    "acquisition",
    "merger",
    "earnings",
    "profit",
    "loss",
    "dividend",
    "bonus",
    "stock split",
    "regulatory",
    "investigation",
    "fraud",
    "lawsuit",
    "ceo",
    "resignation",
    "investment",
    "expansion",
    "contract",
    "order",
    "partnership",
    "ipo"
  ];

  const noiseKeywords = [
    "stocks to watch",
    "top stocks",
    "market roundup",
    "stocks in focus",
    "stocks today",
    "share market today",
    "market today",
    "top gainers",
    "top losers"
  ];

  if (noiseKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return "NOISE";
  }

  if (signalKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return "SIGNAL";
  }

  return "NOISE";
}
module.exports = {
  summarizeNews,
  classifyNewsImportance,
  detectSignalOrNoise
};