const { google } = require('googleapis');
const { query } = require('../lib/db.js');

// Duration of one booking slot, in minutes.
const SLOT_MINUTES = 60;

function isValidPhone(phone) {
  return /^[0-9+ ()-]{7,20}$/.test(phone);
}

async function createCalendarEvent({ date, time, name, phone, details }) {
  const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GABRIEL_EMAIL, BOOKING_CALENDAR_ID } = process.env;
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GABRIEL_EMAIL) {
    return { ok: false, reason: 'not_configured' };
  }
  const auth = new google.auth.JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  const calendar = google.calendar({ version: 'v3', auth });

  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const start = new Date(Date.UTC(y, m - 1, d, hh, mm));
  const end = new Date(start.getTime() + SLOT_MINUTES * 60000);

  const event = await calendar.events.insert({
    calendarId: BOOKING_CALENDAR_ID || 'primary',
    sendUpdates: 'all',
    requestBody: {
      summary: `Programare site: ${name}`,
      description: [
        `Client: ${name}`,
        `Telefon: ${phone}`,
        details ? `Detalii: ${details}` : null,
        '',
        'Programare făcută din agenda de pe site — contactează clientul pentru confirmare.',
      ].filter(Boolean).join('\n'),
      start: { dateTime: start.toISOString(), timeZone: 'Europe/Bucharest' },
      end: { dateTime: end.toISOString(), timeZone: 'Europe/Bucharest' },
      attendees: [{ email: GABRIEL_EMAIL, responseStatus: 'accepted' }],
      reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 0 }] },
    },
  });
  return { ok: true, eventId: event.data.id };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodă neacceptată.' });
    return;
  }

  const { date, time, name, phone, details } = req.body || {};

  if (!date || !time || !name || !phone) {
    res.status(400).json({ error: 'Completează data, ora, numele și telefonul.' });
    return;
  }
  if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    res.status(400).json({ error: 'Dată sau oră invalidă.' });
    return;
  }
  if (!isValidPhone(phone)) {
    res.status(400).json({ error: 'Numărul de telefon nu pare valid.' });
    return;
  }

  let calendarResult = { ok: false };
  try {
    calendarResult = await createCalendarEvent({ date, time, name, phone, details });
  } catch (err) {
    console.error('Calendar booking failed:', err.message);
  }

  let savedToDb = false;
  try {
    await query(
      `INSERT INTO agenda_bookings (booking_date, booking_time, name, phone, details, calendar_event_id) VALUES ($1,$2,$3,$4,$5,$6)`,
      [date, time, name, phone, details || null, calendarResult.eventId || null]
    );
    savedToDb = true;
  } catch (err) {
    if (err.message !== 'NO_DATABASE_CONFIGURED') console.error('Booking DB insert failed:', err.message);
  }

  if (!calendarResult.ok && !savedToDb) {
    res.status(502).json({ error: 'Nu am putut înregistra programarea. Sună-ne sau scrie-ne pe WhatsApp.' });
    return;
  }
  res.status(200).json({ ok: true, eventId: calendarResult.eventId || null, savedToDb });
};
