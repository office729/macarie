const { query } = require('../lib/db.js');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodă neacceptată.' });
    return;
  }
  const d = req.body || {};
  const amount = Number(d.amount);
  if (!d.email || !amount || amount <= 0) {
    res.status(400).json({ error: 'Completează emailul și o sumă validă.' });
    return;
  }
  if (!isValidEmail(d.email)) {
    res.status(400).json({ error: 'Adresa de email nu pare validă.' });
    return;
  }
  try {
    await query(
      `INSERT INTO donations (name, email, phone, amount_ron, anonymous) VALUES ($1,$2,$3,$4,$5)`,
      [d.anonymous ? null : (d.name || null), d.email, d.phone || null, amount, !!d.anonymous]
    );
    res.status(200).json({ ok: true });
  } catch (err) {
    if (err.message === 'NO_DATABASE_CONFIGURED') {
      res.status(200).json({ ok: true, stored: false });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Nu am putut înregistra donația. Sună-ne sau scrie-ne pe WhatsApp.' });
  }
};
