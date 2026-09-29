const { listCreateHandler } = require('../../lib/adminCrud.js');

const COLUMNS = ['event_date', 'title', 'location', 'sort_order'];

module.exports = listCreateHandler('agenda_events', COLUMNS, 'sort_order ASC, id ASC');
