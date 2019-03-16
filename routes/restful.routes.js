const route = require('../services/RouteFactory')
const controller = require('../controllers/CompanyController')

module.exports = app => {
  route(app, controller, { path: '/companies', name: 'company' })
}
