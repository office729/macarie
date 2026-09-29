const { query } = require('../../lib/db.js');
const { requireAuth } = require('../../lib/auth.js');
const { handleDbError } = require('../../lib/adminCrud.js');
const { SETTING_KEYS } = require('../../lib/settings.js');

// GET  -> { items: { key: value } }
// PUT/POST {key, value} -> upserts one whitelisted setting (empty value = back to default)
module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;
  try {
    if (req.method === 'GET') {
      const { rows } = await query('SELECT key, value FROM site_settings');
      const items = {};
      rows.forEach((r) => { if (SETTING_KEYS.includes(r.key)) items[r.key] = r.value; });
      res.status(200).json({ items });
      return;
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      const { key, value } = req.body || {};
      if (!SETTING_KEYS.includes(key)) { res.status(400).json({ error: 'Setare necunoscută.' }); return; }
      const v = String(value || '').trim();
      if (v && !/^https?:\/\//i.test(v)) { res.status(400).json({ error: 'Linkul trebuie să înceapă cu https://' }); return; }
      if (!v) await query('DELETE FROM site_settings WHERE key = $1', [key]);
      else await query('INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [key, v]);
      res.status(200).json({ ok: true });
      return;
    }
    res.status(405).json({ error: 'Metodă neacceptată.' });
  } catch (err) {
    handleDbError(err, res);
  }
};
