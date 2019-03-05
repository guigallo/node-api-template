const jwt = require('jsonwebtoken')
const config = require('../config/config')

const VerifyToken = (req, res, next) => {
  const token = req.headers['x-access-token']
  if(! token) return res.status(403).send({ auth: false, errors: 'Token not provided.'})

  jwt.verify(token, config.secret, (err, decoded) => {
    if(err) return res.status(401).send({ auth: false, errors: err.name })

    req.user = {
      id: decoded.id,
      permissions: decoded.permissions
    }
    
    next()
  })
}

module.exports = VerifyToken