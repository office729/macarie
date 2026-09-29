const { query } = require('../../lib/db.js');

module.exports = async (req, res) => {
  try {
    const { rows } = await query('SELECT DISTINCT booking_date FROM agenda_bookings');
    res.status(200).json({ dates: rows.map(r => r.booking_date) });
  } catch (err) {
    res.status(200).json({ dates: [] });
  }
};
