const Controller = require('./Controller');
const { check } = require('express-validator/check');
const Model = require('../models/Company');

class CategoryController extends Controller {
  constructor(req, res) {
    super(req, res, 'Category', Model, ['name']);
  }
}

module.exports = {
  validate: [
    check('name').not().isEmpty().withMessage('Name is required')
  ],
  create (req, res)   { new CategoryController(req, res).create() },
  read (req, res)     { new CategoryController(req, res).read() },
  readById (req, res) { new CategoryController(req, res).readById() },
  update (req, res)   { new CategoryController(req, res).update() },
  delete (req, res)   { new CategoryController(req, res).delete() },
}