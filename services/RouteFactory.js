const guard = require('express-jwt-permissions')()
const handlPermissionDenied = require('../middlewares/handlePermissionDenied')
const VerifyToken = require('../middlewares/VerifyToken')

module.exports = (app, controller, { path, name }) => {
  if (!path) throw new Error(`Route must have property 'path'`)
  if (!name) throw new Error(`Route must have property 'name'`)

  /*
  let path = route.path
  let name = route.name
  */

  app
    .post(
      path,
      VerifyToken,
      guard.check([`${name}:create`]),
      handlPermissionDenied,
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
}
