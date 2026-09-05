const Parser = require('rss-parser');
const { getDB } = require('./db');

const parser = new Parser();

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
}

function areSimilarTitles(title1, title2) {
  const words1 = new Set(normalizeTitle(title1));
  const words2 = new Set(normalizeTitle(title2));

  const intersection = [...words1].filter(word =>
    words2.has(word)
  );

  const smallerSize = Math.min(
    words1.size,
    words2.size
  );

  if (smallerSize === 0) {
    return false;
  }

  const similarity =
    intersection.length / smallerSize;

  return similarity >= 0.6;
}

async function getStockNews(symbol) {
  try {
    // Convert RELIANCE.NS → RELIANCE
    const cleanSymbol = symbol.replace('.NS', '');

    const feedUrl =
      `https://news.google.com/rss/search?q=${encodeURIComponent(
        cleanSymbol + ' stock India'
      )}&hl=en-IN&gl=IN&ceid=IN:en`;

    const feed = await parser.parseURL(feedUrl);

    const news = feed.items.slice(0, 10).map(item => ({
      title: item.title,
      link: item.link,
      publishedAt: item.pubDate || null,
      source: item.creator || 'Google News'
    }));

    // Remove similar/duplicate news
    const uniqueNews = [];

    for (const item of news) {
      const duplicate = uniqueNews.some(existing =>
        areSimilarTitles(
          existing.title,
          item.title
        )
      );

      if (!duplicate) {
        uniqueNews.push(item);
      }
    }

    // Save unique news to database
    const db = getDB();

    for (const item of uniqueNews) {
      try {
        await db.run(
          `INSERT OR IGNORE INTO news (
            stock_symbol,
            title,
            link,
            source,
            published_at
          )
          VALUES (?, ?, ?, ?, ?)`,
          [
            symbol,
            item.title,
            item.link,
            item.source,
            item.publishedAt
          ]
        );
      } catch (err) {
        console.log(
          `News save failed for ${symbol}: ${err.message}`
        );
      }
    }

    return uniqueNews;

  } catch (err) {
    console.log(
      `News fetch failed for ${symbol}: ${err.message}`
    );

    return [];
  }
}

module.exports = { getStockNews };