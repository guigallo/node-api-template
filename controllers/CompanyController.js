const Controller = require('./Controller')
const { check } = require('express-validator/check')
const Model = require('../models/Company')

class CompanyController extends Controller {
  constructor (req, res) {
    super(req, res, 'Company', Model, ['name'])
  }
}

module.exports = {
  validate: [
    check('name').not().isEmpty().withMessage('Name is required')
  ],
  create (req, res) { new CompanyController(req, res).create() },
  read (req, res) { new CompanyController(req, res).read() },
  readById (req, res) { new CompanyController(req, res).readById() },
  update (req, res) { new CompanyController(req, res).update() },
  delete (req, res) { new CompanyController(req, res).delete() }
}
