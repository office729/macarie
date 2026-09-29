const { makeSessionCookie } = require('../../lib/auth.js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodă neacceptată.' });
    return;
  }
  const { password } = req.body || {};
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) {
    res.status(500).json({ error: 'Dashboard-ul nu este încă configurat (lipsește ADMIN_PASSWORD).' });
    return;
  }
  if (!password || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Parolă incorectă.' });
    return;
  }
  res.setHeader('Set-Cookie', makeSessionCookie());
  res.status(200).json({ ok: true });
};
