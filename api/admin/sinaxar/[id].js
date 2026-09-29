const { updateDeleteHandler } = require('../../../lib/adminCrud.js');

const COLUMNS = ['month', 'day', 'sfinti', 'tropar', 'condac', 'tropar_text', 'condac_text', 'tropar_audio_url', 'condac_audio_url'];

module.exports = updateDeleteHandler('sinaxar_days', COLUMNS);
