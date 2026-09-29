const { listCreateHandler } = require('../../lib/adminCrud.js');

const COLUMNS = ['month', 'day', 'sfinti', 'tropar', 'condac', 'tropar_text', 'condac_text', 'tropar_audio_url', 'condac_audio_url'];

module.exports = listCreateHandler('sinaxar_days', COLUMNS, 'month ASC, day ASC');
