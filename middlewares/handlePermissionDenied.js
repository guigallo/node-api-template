module.exports = (err, req, res, next) => {
  if (err.code === 'permission_denied')
    return res.status(403).json({ errors: 'User has no permission'})
  next()
}