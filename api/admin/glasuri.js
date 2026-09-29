const { listCreateHandler } = require('../../lib/adminCrud.js');

const COLUMNS = ['n', 'title', 'meta', 'audio_url', 'sort_order'];

module.exports = listCreateHandler('glas_tracks', COLUMNS, 'sort_order ASC, id ASC');
