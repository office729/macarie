const { query } = require('../../lib/db.js');

module.exports = async (req, res) => {
  try {
    const { rows } = await query('SELECT id, n, title, meta, audio_url FROM glas_tracks ORDER BY sort_order ASC, id ASC');
    res.status(200).json({ items: rows });
  } catch (err) {
    res.status(200).json({ items: [] });
  }
};
