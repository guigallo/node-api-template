const controller = require('../controllers/userController');
const VerifyToken = require('../utils/VerifyToken');
const guard = require('express-jwt-permissions')();
const ROTA = '/users';

module.exports = function(app) {
  app.get(ROTA, VerifyToken, guard.check('user:read'), controller.getAllUsers);
  app.get(ROTA + '/:id', VerifyToken, guard.check('user:read'), controller.getUserById);
  app.post(ROTA, controller.createUser);
  app.put(ROTA + '/:id', VerifyToken, guard.check('user:write'), controller.updateUser);
  app.delete(ROTA + '/:id', VerifyToken, guard.check('user:write'), controller.deleteUser);
}