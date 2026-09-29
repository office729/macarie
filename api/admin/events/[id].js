const { updateDeleteHandler } = require('../../../lib/adminCrud.js');

const COLUMNS = ['event_date', 'title', 'location', 'sort_order'];

module.exports = updateDeleteHandler('agenda_events', COLUMNS);
