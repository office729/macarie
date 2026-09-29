const { isAuthenticated } = require('../../lib/auth.js');

module.exports = async (req, res) => {
  res.status(200).json({ authenticated: isAuthenticated(req) });
};
