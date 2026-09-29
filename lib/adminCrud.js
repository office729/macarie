const { query } = require('./db.js');
const { requireAuth } = require('./auth.js');

// Generic list+create handler for /api/admin/<entity>.js, and a matching
// update+delete handler for /api/admin/<entity>/[id].js. Column names are
// passed explicitly (not introspected) so we never interpolate untrusted
// field names into SQL.
function listCreateHandler(table, columns, orderBy) {
  return async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
      if (req.method === 'GET') {
        const { rows } = await query(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
        res.status(200).json({ items: rows });
        return;
      }
      if (req.method === 'POST') {
        const body = req.body || {};
        const cols = columns.filter((c) => body[c] !== undefined);
        if (cols.length === 0) { res.status(400).json({ error: 'Lipsesc câmpuri.' }); return; }
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
        const values = cols.map((c) => body[c]);
        const { rows } = await query(
          `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`,
          values
        );
        res.status(201).json({ item: rows[0] });
        return;
      }
      res.status(405).json({ error: 'Metodă neacceptată.' });
    } catch (err) {
      handleDbError(err, res);
    }
  };
}

function updateDeleteHandler(table, columns) {
  return async (req, res) => {
    if (!requireAuth(req, res)) return;
    const id = req.query.id;
    try {
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const body = req.body || {};
        const cols = columns.filter((c) => body[c] !== undefined);
        if (cols.length === 0) { res.status(400).json({ error: 'Lipsesc câmpuri.' }); return; }
        const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
        const values = cols.map((c) => body[c]);
        const { rows } = await query(
          `UPDATE ${table} SET ${setClause} WHERE id = $${cols.length + 1} RETURNING *`,
          [...values, id]
        );
        if (!rows[0]) { res.status(404).json({ error: 'Nu a fost găsit.' }); return; }
        res.status(200).json({ item: rows[0] });
        return;
      }
      if (req.method === 'DELETE') {
        await query(`DELETE FROM ${table} WHERE id = $1`, [id]);
        res.status(200).json({ ok: true });
        return;
      }
      res.status(405).json({ error: 'Metodă neacceptată.' });
    } catch (err) {
      handleDbError(err, res);
    }
  };
}

function handleDbError(err, res) {
  if (err.message === 'NO_DATABASE_CONFIGURED') {
    res.status(503).json({ error: 'Baza de date nu este încă conectată la acest proiect.' });
    return;
  }
  if (err.code === '23505') {
    res.status(409).json({ error: 'Există deja o intrare cu aceleași date — editeaz-o pe cea existentă din listă în loc să adaugi una nouă.' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Eroare de server.' });
}

module.exports = { listCreateHandler, updateDeleteHandler, handleDbError };
