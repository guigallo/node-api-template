const { permissionBy } = require('../config')
const validate = require('../middlewares/validateRequest')
const logger = require('../services/logger')
const PasswordUtil = require('../utils/PasswordsUtil')
const PERMISSIONS_BY = require('../enum/permissions')

class Controller {
  constructor (req, res, name, Model, properties) {
    this.request = req
    this.response = res
    this.name = name
    this.Model = Model
    this.properties = properties
  }

  _log (action, newId = undefined) {
    let newid = (newId) ? ` ${newId} ` : ' '
    let by = ''
    if (this.request.user) by = ` by ${this.request.user.id}`
    logger.info(`${Date.now()}: ${this.name}${newid}${action}${by}`)
  }

  _queryWithPerm (where = {}) {
    const { id, contract } = this.request.user
    const { ALL, CONTRACT, OWNER } = PERMISSIONS_BY

    switch (permissionBy) {
      case ALL: return Object.assign({}, where)
      case CONTRACT: return Object.assign({}, where, { contract })
      case OWNER: return Object.assign({}, where, { owner: id })
      default: throw new Error('invalid config permission')
    }
  }

  _hasPermToAccess (document) {
    const { id, contract } = this.request.user
    const { ALL, CONTRACT, OWNER } = PERMISSIONS_BY

    switch (permissionBy) {
      case ALL: return true
      case CONTRACT: return document.contract && document.contract.toString() === contract.toString()
      case OWNER: return document.owner && document.owner.toString() === id.toString()
      default: throw new Error('invalid config permission')
    }
  }

  create (callback) {
    if (!validate(this.request, this.response)) return

    const { name, Model, response, properties, request: { body, user } } = this

    let ownProperties = name === 'User' ? {} : { owner: user.id, contract: user.contract }
    const document = properties.reduce((accumulator, property) => {
      if (name === 'User' && property === 'password') return Object.assign({}, accumulator, { [property]: PasswordUtil.hashed(body[property]) })

      return body[property]
        ? Object.assign({}, accumulator, { [property]: body[property] })
        : accumulator
    }, ownProperties)

    Model.create(document, (errors, created) => {
      if (errors && errors.code === 11000) return response.status(403).json({ message: 'Cant create duplicated data' })
      if (errors) return response.status(500).json({ errors, message: 'Error on create document' })

      this._log('created')

      if (callback) return callback(response, created)
      response.status(201).json({ result: created })
    })
  }

  read (callback) {
    const { Model, name, response } = this

    Model.find(this._queryWithPerm(), (err, read) => {
      if (err) return response.status(500).json({ message: `Error to get ${name}` })
      if (!read) return response.status(404).json({ message: 'Nothing to return' })

      this._log('read')

      if (callback) return callback(response, read)
      response.status(200).json({ result: read })
    })
  }

  readById (callback) {
    const { Model, name, response, request: { params: { id } } } = this

    Model.findById(id, (err, readById) => {
      if (err) return response.status(500).json({ errors: `Error to get ${name}` })
      if (!readById) return response.status(404).json({ errors: `${name} not found` })
      if (!this._hasPermToAccess(readById)) return response.status(403).json({ errors: `User has no permission to access this document` })

      this._log('read')

      if (callback) return callback(response, readById)
      response.status(200).json({ result: readById })
    })
  }

  update (callback) {
    const { response, request, name } = this

    this.readById(async (r, document) => {
      const { body } = request
      Object.keys(body).forEach(property => {
        if (this.properties.includes(property)) document[property] = body[property]
      })

      await document.save()

      this._log('updated', request.params.id)

      if (callback) return callback(response, request.body)
      response.status(201).json({ message: `${name} update successfully`, document })
    })
  }

  delete (callback) {
    const { response, request, name } = this
    const { params: { id } } = request

    this.readById(async (r, document) => {
      await document.delete()

      this._log('deleted', id)

      if (callback) return callback(response, id)
      response.status(201).json({ message: `${name} deleted successfully` })
    })
  }
}

module.exports = Controller
