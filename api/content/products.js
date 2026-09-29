const { query } = require('../../lib/db.js');

module.exports = async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM products ORDER BY sort_order ASC, id ASC');
    res.status(200).json({ items: rows });
  } catch (err) {
    // No DB yet, or empty — let the caller fall back to its own hardcoded list.
    res.status(200).json({ items: [] });
  }
};
