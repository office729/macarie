const { updateDeleteHandler } = require('../../../lib/adminCrud.js');

const COLUMNS = ['url', 'title', 'sort_order'];

module.exports = updateDeleteHandler('tiktok_videos', COLUMNS);
