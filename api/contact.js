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
  if (!d.prenume || !d.nume || !d.email || !d.mesaj) {
    res.status(400).json({ error: 'Completează numele, emailul și mesajul.' });
    return;
  }
  if (!isValidEmail(d.email)) {
    res.status(400).json({ error: 'Adresa de email nu pare validă.' });
    return;
  }
  try {
    await query(
      `INSERT INTO contact_messages (prenume, nume, email, telefon, subiect, mesaj) VALUES ($1,$2,$3,$4,$5,$6)`,
      [d.prenume, d.nume, d.email, d.telefon || null, d.subiect || null, d.mesaj]
    );
    res.status(200).json({ ok: true });
  } catch (err) {
    if (err.message === 'NO_DATABASE_CONFIGURED') {
      res.status(200).json({ ok: true, stored: false });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Nu am putut trimite mesajul. Sună-ne sau scrie-ne pe WhatsApp.' });
  }
};
