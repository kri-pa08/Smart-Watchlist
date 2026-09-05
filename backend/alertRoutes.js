const express = require('express');
const router = express.Router();

const { getDB } = require('./db');

// GET all alerts
router.get('/', async (req, res) => {
  try {
    const db = getDB();

    const alerts = await db.all(`
      SELECT *
      FROM alerts
      ORDER BY created_at DESC
    `);

    res.json(alerts);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;