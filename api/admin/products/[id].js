const { updateDeleteHandler } = require('../../../lib/adminCrud.js');

const COLUMNS = ['title', 'description', 'price', 'tag', 'category', 'perioada', 'img_url', 'is_new', 'sort_order'];

module.exports = updateDeleteHandler('products', COLUMNS);
