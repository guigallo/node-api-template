const controller = require('../controllers/loginoutController')
const VerifyToken = require('../middlewares/VerifyToken')

const ROTA = '/log'
module.exports = app => app
  .post(`${ROTA}/in`, controller.login)
  .get(`${ROTA}/me`, VerifyToken, controller.userData)
  .get(`${ROTA}/out`, controller.logout)
  .put(`${ROTA}/newpassword`, VerifyToken, controller.newPassword)