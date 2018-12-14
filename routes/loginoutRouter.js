const controller = require('../controllers/loginoutController');
const VerifyToken = require('../utils/VerifyToken');
const ROTA = '/log';

module.exports = function(app) {
  app.post(`${ROTA}/in`, controller.login);
  app.get(`${ROTA}/me`, VerifyToken, controller.userData);
  app.get(`${ROTA}/out`, controller.logout);
  app.put(`${ROTA}/newpassword`, VerifyToken, controller.newPassword);
}