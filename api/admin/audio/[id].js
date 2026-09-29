const { query } = require('../../../lib/db.js');
const { requireAuth } = require('../../../lib/auth.js');
const { handleDbError } = require('../../../lib/adminCrud.js');

// POST {idx, data:<base64>}  -> stores one chunk
// POST {done:true}           -> verifies the upload is complete and publishes it
// DELETE                     -> removes the file (used when audio is replaced/removed)
module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.query.id, 10);
  if (!(id > 0)) { res.status(400).json({ error: 'Id invalid.' }); return; }
  try {
    if (req.method === 'DELETE') {
      await query('DELETE FROM audio_files WHERE id = $1', [id]);
      res.status(200).json({ ok: true });
      return;
    }
    if (req.method !== 'POST') { res.status(405).json({ error: 'Metodă neacceptată.' }); return; }
    const { rows } = await query('SELECT size, chunk_size, complete FROM audio_files WHERE id = $1', [id]);
    const f = rows[0];
    if (!f) { res.status(404).json({ error: 'Încărcarea nu există.' }); return; }
    const expected = Math.ceil(f.size / f.chunk_size);
    const body = req.body || {};

    if (body.done) {
      const stat = await query('SELECT count(*)::int AS n, coalesce(sum(octet_length(data)), 0)::bigint AS bytes FROM audio_chunks WHERE file_id = $1', [id]);
      if (stat.rows[0].n !== expected || Number(stat.rows[0].bytes) !== f.size) {
        res.status(409).json({ error: 'Fișierul nu s-a încărcat complet. Încearcă din nou.' });
        return;
      }
      await query('UPDATE audio_files SET complete = true WHERE id = $1', [id]);
      res.status(200).json({ ok: true, url: '/api/audio/' + id });
      return;
    }

    if (f.complete) { res.status(409).json({ error: 'Fișierul e deja încărcat.' }); return; }
    const idx = Number(body.idx);
    if (!Number.isInteger(idx) || idx < 0 || idx >= expected || typeof body.data !== 'string') {
      res.status(400).json({ error: 'Bucată invalidă.' });
      return;
    }
    const buf = Buffer.from(body.data, 'base64');
    const wanted = idx === expected - 1 ? f.size - idx * f.chunk_size : f.chunk_size;
    if (buf.length !== wanted) { res.status(400).json({ error: 'Dimensiune bucată invalidă.' }); return; }
    await query(
      'INSERT INTO audio_chunks (file_id, idx, data) VALUES ($1, $2, $3) ON CONFLICT (file_id, idx) DO UPDATE SET data = EXCLUDED.data',
      [id, idx, buf]
    );
    res.status(200).json({ ok: true });
  } catch (err) {
    handleDbError(err, res);
  }
};
