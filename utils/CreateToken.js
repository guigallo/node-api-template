const config = require('../config')
const jwt = require('jsonwebtoken')

function CreateToken (payload) {
  const options = { expiresIn: config.expireToken }
  return jwt.sign(payload, config.secret, options)
}

module.exports = CreateToken
