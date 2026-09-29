const { query } = require('../../lib/db.js');
const { requireAuth } = require('../../lib/auth.js');
const { handleDbError } = require('../../lib/adminCrud.js');

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;
  if (req.method !== 'GET') { res.status(405).json({ error: 'Metodă neacceptată.' }); return; }
  try {
    const { rows } = await query('SELECT * FROM contract20_submissions ORDER BY created_at DESC');
    res.status(200).json({ items: rows });
  } catch (err) {
    handleDbError(err, res);
  }
};
