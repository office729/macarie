const { query } = require('../../lib/db.js');
const { requireAuth } = require('../../lib/auth.js');
const { handleDbError } = require('../../lib/adminCrud.js');

const MAX_SIZE = 40 * 1024 * 1024;
const CHUNK_SIZE = 1536 * 1024;

const EXT_MIME = { mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav', ogg: 'audio/ogg', oga: 'audio/ogg', opus: 'audio/ogg', flac: 'audio/flac', weba: 'audio/webm' };

// Starts a chunked audio upload: the browser then sends the file in pieces to
// /api/admin/audio/<id> and finishes with {done:true}.
module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;
  if (req.method !== 'POST') { res.status(405).json({ error: 'Metodă neacceptată.' }); return; }
  try {
    const body = req.body || {};
    const size = Number(body.size);
    if (!Number.isInteger(size) || size < 1) { res.status(400).json({ error: 'Fișier invalid.' }); return; }
    if (size > MAX_SIZE) { res.status(413).json({ error: 'Fișierul e prea mare (maxim 40 MB).' }); return; }
    const filename = String(body.filename || '').slice(0, 200);
    const ext = (filename.split('.').pop() || '').toLowerCase();
    let mime = String(body.mime || '').toLowerCase();
    if (!mime.startsWith('audio/')) mime = EXT_MIME[ext] || '';
    if (!mime) { res.status(400).json({ error: 'Alege un fișier audio (mp3, m4a, wav, ogg).' }); return; }
    // Housekeeping: drop abandoned uploads and files nothing references any more.
    await query("DELETE FROM audio_files WHERE complete = false AND created_at < now() - interval '1 day'");
    const refs = await query('SELECT audio_url AS u FROM glas_tracks UNION ALL SELECT tropar_audio_url FROM sinaxar_days UNION ALL SELECT condac_audio_url FROM sinaxar_days');
    const used = new Set(refs.rows.map((r) => /^\/api\/audio\/(\d+)$/.exec(r.u || '')).filter(Boolean).map((m) => parseInt(m[1], 10)));
    const old = await query("SELECT id FROM audio_files WHERE created_at < now() - interval '1 day'");
    for (const f of old.rows) if (!used.has(f.id)) await query('DELETE FROM audio_files WHERE id = $1', [f.id]);
    const { rows } = await query(
      'INSERT INTO audio_files (filename, mime, size, chunk_size) VALUES ($1, $2, $3, $4) RETURNING id',
      [filename, mime, size, CHUNK_SIZE]
    );
    res.status(201).json({ id: rows[0].id, chunk_size: CHUNK_SIZE, url: '/api/audio/' + rows[0].id });
  } catch (err) {
    handleDbError(err, res);
  }
};
