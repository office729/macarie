const { query } = require('../lib/db.js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodă neacceptată.' });
    return;
  }
  const d = req.body || {};
  if (!d.denumire || !d.cui || !d.admin_email || !d.cnp) {
    res.status(400).json({ error: 'Completează câmpurile obligatorii.' });
    return;
  }
  try {
    await query(
      `INSERT INTO contract20_submissions
        (denumire, cui, reg_com, adresa, cod_postal, judet, localitate, iban, banca, suma,
         admin_prenume, admin_nume, admin_email, admin_telefon, cnp, ci_numar, ci_serie, ci_eliberata_de, ci_data, signature_png)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
      [
        d.denumire, d.cui, d.reg_com || null, d.adresa, d.cod_postal || null, d.judet, d.localitate,
        d.iban, d.banca || null, d.suma || null,
        d.admin_prenume, d.admin_nume, d.admin_email, d.admin_telefon || null,
        d.cnp, d.ci_numar || null, d.ci_serie || null, d.ci_eliberata_de || null, d.ci_data || null,
        d.signature || null,
      ]
    );
    res.status(200).json({ ok: true });
  } catch (err) {
    if (err.message === 'NO_DATABASE_CONFIGURED') {
      res.status(200).json({ ok: true, stored: false });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Nu am putut salva datele, dar poți în continuare descărca PDF-ul.' });
  }
};
