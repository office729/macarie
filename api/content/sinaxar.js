const { query } = require('../../lib/db.js');

module.exports = async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM sinaxar_days ORDER BY month ASC, day ASC');
    res.status(200).json({ items: rows });
  } catch (err) {
    res.status(200).json({ items: [] });
  }
};
