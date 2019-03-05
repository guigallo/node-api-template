const Controller = require('./Controller')
const { check } = require('express-validator/check')
const Model = require('../models/User')
const CreateToken = require('../utils/CreateToken')

class UserController extends Controller {
  constructor(req, res) {
    super(req, res, 'User', Model, ['name', 'email', 'password'])
  }

  create() {
    super.create((res, created) => res.status(201).json({ auth: true, token: CreateToken(created._id, created.permissions) }))
  }
  
  read() {
    super.read(users => {
      let usersFiltered = []
      users.map(user => usersFiltered.push({
          id: user._id,
          name: user.name,
          email: user.email,
          permissions: user.permissions
        })
      )

      return this.response.status(200).json({ result: usersFiltered })
    })
  }

  readById() {
    super.readById(user => 
      this.response.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
      })
    )
  }

  update() {
    const body = this.request.body
    if(body.hasOwnProperty('password') || body.hasOwnProperty('newPassword'))
      return this.response.status(400).json({ message: 'To change password, use the path "/user/newpassword"' })

    super.update()
  }
}

module.exports = {
  validate: [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('email').not().isEmpty().withMessage('Email is required'),
    check('password').not().isEmpty().withMessage('Password is required')
  ],
  create (req, res)   { new UserController(req, res).create() },
  read (req, res)     { new UserController(req, res).read() },
  readById (req, res) { new UserController(req, res).readById() },
  update (req, res)   { new UserController(req, res).update() },
  delete (req, res)   { new UserController(req, res).delete() },
}