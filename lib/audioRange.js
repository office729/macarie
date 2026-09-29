// HTTP Range handling for audio served from Postgres. A serverless response
// is capped (~4.5 MB), so every reply is limited to MAX_SLICE bytes and the
// browser fetches the rest with follow-up Range requests (206 Partial Content).
const MAX_SLICE = 3 * 1024 * 1024;

function parseRange(header, total) {
  let start = 0;
  let end = total - 1;
  let partial = false;
  if (header) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(String(header).trim());
    if (!m || (m[1] === '' && m[2] === '')) return { invalid: true };
    if (m[1] === '') {
      const n = parseInt(m[2], 10);
      if (!(n > 0)) return { invalid: true };
      start = Math.max(0, total - n);
    } else {
      start = parseInt(m[1], 10);
      if (m[2] !== '') end = Math.min(parseInt(m[2], 10), total - 1);
    }
    if (start > end || start >= total) return { invalid: true };
    partial = true;
  }
  if (end - start + 1 > MAX_SLICE) { end = start + MAX_SLICE - 1; partial = true; }
  return { start, end, partial };
}

module.exports = { parseRange, MAX_SLICE };
