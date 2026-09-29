const { listCreateHandler } = require('../../lib/adminCrud.js');

const COLUMNS = ['title', 'url', 'sort_order'];

module.exports = listCreateHandler('youtube_videos', COLUMNS, 'sort_order ASC, id ASC');
