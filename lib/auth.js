const crypto = require('crypto');

const SECRET = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'fallback-dev-secret';
const COOKIE_NAME = 'macarie_admin';
const SESSION_HOURS = 12;

function sign(value) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('hex');
}

function makeSessionCookie() {
  const expires = Date.now() + SESSION_HOURS * 3600 * 1000;
  const payload = String(expires);
  const token = payload + '.' + sign(payload);
  const isProd = process.env.VERCEL_ENV !== 'development';
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_HOURS * 3600}${isProd ? '; Secure' : ''}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`;
}

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[COOKIE_NAME];
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  if (sig !== sign(payload)) return false;
  return Number(payload) > Date.now();
}

function requireAuth(req, res) {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Neautentificat.' });
    return false;
  }
  return true;
}

module.exports = { makeSessionCookie, clearSessionCookie, isAuthenticated, requireAuth };
