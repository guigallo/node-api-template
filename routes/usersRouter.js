const controller = require('../controllers/UserController')
const guard = require('express-jwt-permissions')()
const handlPermissionDenied = require('../middlewares/handlePermissionDenied')
const VerifyToken = require('../middlewares/VerifyToken')

const path = '/users'
const name = 'user'
module.exports = app => app
  .post( 
    path,
    controller.validate,
    controller.create)
  .get(
    path,
    VerifyToken,
    guard.check([`${name}:read`]),
    handlPermissionDenied,
    controller.read)
  .get(
    `${path}/:id`,
    VerifyToken,
    guard.check([`${name}:read`]),
    handlPermissionDenied,
    controller.readById)
  .put(
    `${path}/:id`,
    VerifyToken,
    guard.check([`${name}:update`]),
    handlPermissionDenied,
    controller.update)
  .delete(
    `${path}/:id`,
    VerifyToken,
    guard.check([`${name}:delete`]),
    handlPermissionDenied,
    controller.delete)