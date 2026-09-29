const { query } = require('../lib/db.js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodă neacceptată.' });
    return;
  }
  const d = req.body || {};
  if (!d.nume || !d.prenume || !d.cnp || !d.email || !d.telefon) {
    res.status(400).json({ error: 'Completează câmpurile obligatorii.' });
    return;
  }
  try {
    await query(
      `INSERT INTO f230_submissions
        (nume, prenume, initiala, cnp, email, telefon, strada, numar, judet, localitate, cod_postal, bloc, scara, apartament, distribuire_2ani, signature_png)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [
        d.nume, d.prenume, d.initiala || null, d.cnp, d.email, d.telefon,
        d.strada, d.numar, d.judet, d.localitate, d.codpostal, d.bloc || null, d.scara || null, d.apartament || null,
        !!d.distribuire2ani, d.signature || null,
      ]
    );
    res.status(200).json({ ok: true });
  } catch (err) {
    if (err.message === 'NO_DATABASE_CONFIGURED') {
      // Not fatal for the visitor — they still get their downloaded PDF client-side.
      res.status(200).json({ ok: true, stored: false });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Nu am putut salva datele, dar poți în continuare descărca PDF-ul.' });
  }
};
