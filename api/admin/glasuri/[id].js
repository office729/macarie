const { updateDeleteHandler } = require('../../../lib/adminCrud.js');

const COLUMNS = ['n', 'title', 'meta', 'audio_url', 'sort_order'];

module.exports = updateDeleteHandler('glas_tracks', COLUMNS);
