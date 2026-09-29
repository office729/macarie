const { query } = require('../../lib/db.js');

module.exports = async (req, res) => {
  try {
    const { rows } = await query('SELECT id, title, url FROM youtube_videos ORDER BY sort_order ASC, id ASC');
    res.status(200).json({ items: rows });
  } catch (err) {
    res.status(200).json({ items: [] });
  }
};
