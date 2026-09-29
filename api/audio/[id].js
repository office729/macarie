const { query } = require('../../lib/db.js');
const { parseRange } = require('../../lib/audioRange.js');

// Public: streams an uploaded audio file (stored in audio_chunks) with Range support.
module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.status(405).end(); return; }
  const id = parseInt(req.query.id, 10);
  if (!(id > 0)) { res.status(404).end(); return; }
  try {
    const { rows } = await query('SELECT mime, size, chunk_size FROM audio_files WHERE id = $1 AND complete = true', [id]);
    const f = rows[0];
    if (!f) { res.status(404).end(); return; }
    const total = f.size;
    const r = parseRange(req.headers.range, total);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', f.mime || 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    if (r.invalid) {
      res.setHeader('Content-Range', 'bytes */' + total);
      res.status(416).end();
      return;
    }
    const len = r.end - r.start + 1;
    res.setHeader('Content-Length', String(len));
    if (r.partial) res.setHeader('Content-Range', 'bytes ' + r.start + '-' + r.end + '/' + total);
    res.statusCode = r.partial ? 206 : 200;
    if (req.method === 'HEAD') { res.end(); return; }
    const c0 = Math.floor(r.start / f.chunk_size);
    const c1 = Math.floor(r.end / f.chunk_size);
    const data = await query('SELECT idx, data FROM audio_chunks WHERE file_id = $1 AND idx BETWEEN $2 AND $3 ORDER BY idx', [id, c0, c1]);
    const buf = Buffer.concat(data.rows.map((x) => x.data));
    const offset = r.start - c0 * f.chunk_size;
    res.end(buf.subarray(offset, offset + len));
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};
