const { listCreateHandler } = require('../../lib/adminCrud.js');

const COLUMNS = ['title', 'description', 'price', 'tag', 'category', 'perioada', 'img_url', 'is_new', 'sort_order'];

module.exports = listCreateHandler('products', COLUMNS, 'sort_order ASC, id ASC');
