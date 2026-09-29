const { updateDeleteHandler } = require('../../../lib/adminCrud.js');

const COLUMNS = ['title', 'url', 'sort_order'];

module.exports = updateDeleteHandler('youtube_videos', COLUMNS);
