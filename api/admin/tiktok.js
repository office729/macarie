const { listCreateHandler } = require('../../lib/adminCrud.js');

const COLUMNS = ['url', 'title', 'sort_order'];

module.exports = listCreateHandler('tiktok_videos', COLUMNS, 'sort_order ASC, id ASC');
