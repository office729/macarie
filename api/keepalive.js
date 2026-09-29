const { query } = require('../lib/db.js');

// Called daily by the Vercel cron in vercel.json so the free Supabase
// project never sits idle long enough to be auto-paused.
module.exports = async (req, res) => {
  try {
    await query('SELECT 1');
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(503).json({ ok: false });
  }
};
