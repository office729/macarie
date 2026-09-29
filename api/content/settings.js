const { query } = require('../../lib/db.js');
const { SETTING_KEYS } = require('../../lib/settings.js');

module.exports = async (req, res) => {
  try {
    const { rows } = await query('SELECT key, value FROM site_settings');
    const items = {};
    rows.forEach((r) => { if (SETTING_KEYS.includes(r.key) && r.value) items[r.key] = r.value; });
    res.status(200).json({ items });
  } catch (err) {
    res.status(200).json({ items: {} });
  }
};
