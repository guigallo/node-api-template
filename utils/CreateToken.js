const config = require('../config/config')
const jwt = require('jsonwebtoken')

function CreateToken(id, permissions) {
  const payload = { id, permissions }
  const options = { expiresIn: config.expireToken }
  return jwt.sign(payload, config.secret, options)
}

module.exports = CreateToken