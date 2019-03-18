const env = require('./config/env')
const User = require('../models/User')
const assert = require('assert')
const should = env.should() // eslint-disable-line
const logger = require('../services/logger')

let mockData
const company = () => mockData.company
const defaultUser = () => mockData.defaultUser
const lowPermissionUser = () => mockData.lowPermissionUser
const defaultToken = () => mockData.defaultUserToken
const lowPermToken = () => mockData.lowPermissionToken

describe('User routes', () => { // eslint-disable-line
  before(function (done) { // eslint-disable-line
    this.timeout(5000)

    env.saveDefUsersAndGetTokens().then((data) => {
      mockData = data
      done()
    }).catch(err => console.log(err))
  })

  after(done => { // eslint-disable-line
    User.deleteMany({}, () => {
      done()
    })
  })

  /**
   * Test GET users
   */
  describe('# GET users', () => { // eslint-disable-line
    it('Get array of users', done => { // eslint-disable-line
      env.chai.request(env.express)
        .get('/users')
        .set('x-access-token', mockData.defaultUserToken)
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.have.status(200)
          assert.deepEqual(res.body.result, [{
            id: mockData.defaultUser._id.toString(),
            name: 'Test user',
            email: 'mocha@test.com',
            permissions: ['user:create', 'user:read', 'user:update', 'user:delete'],
            contract: 'nbj',
            companies: [ company().id ]
          }, {
            id: mockData.lowPermissionUser._id.toString(),
            name: 'Low permission user',
            email: 'low@permission.com',
            permissions: ['nothing'],
            contract: 'nbj',
            companies: []
          }])
          done()
        })
    })

    it('Get users with no permission', done => { // eslint-disable-line
      env.chai.request(env.express)
        .get('/users')
        .set('x-access-token', mockData.lowPermissionToken)
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.have.status(403)
          assert.deepEqual(res.body, { errors: 'User has no permission' })

          done()
        })
    })

    it('Get users without token', done => { // eslint-disable-line
      env.chai.request(env.express)
        .get('/users')
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.have.status(403)
          assert.deepEqual(res.body, {
            auth: false,
            errors: 'Token not provided.'
          })
          done()
        })
    })
  })

  /**
   * Test GET user by ID
   */
  describe('# GET user by ID', () => { // eslint-disable-line
    it('Success to GET user by ID', done => { // eslint-disable-line
      let id = defaultUser().id
      env.chai.request(env.express)
        .get(`/users/${id}`)
        .set('x-access-token', defaultToken())
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.has.status(200)
          assert.deepEqual(res.body, {
            id,
            name: 'Test user',
            email: 'mocha@test.com',
            contract: 'nbj',
            permissions: [
              'user:create',
              'user:read',
              'user:update',
              'user:delete'
            ],
            companies: [ company().id ]
          })
          done()
        })
    })

    it('Error to get users with no permission', done => { // eslint-disable-line
      let id = lowPermissionUser().id
      env.chai.request(env.express)
        .get(`/users/${id}`)
        .set('x-access-token', lowPermToken())
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.has.status(403)
          assert.deepEqual(res.body, { errors: 'User has no permission' })
          done()
        })
    })

    it('Error to get users with no token', done => { // eslint-disable-line
      let id = lowPermissionUser().id
      env.chai.request(env.express)
        .get(`/users/${id}`)
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.has.status(403)
          res.body.should.have.property('auth').eql(false)
          res.body.should.have.property('errors').eql('Token not provided.')
          done()
        })
    })

    /*
    it('Search user not found', done => { // eslint-disable-line
      env.chai.request(env.express)
        .get(`/users/invalidId`)
        .set('x-access-token', defaultToken())
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.has.status(404)
          assert.deepEqual(res.body, { errors: 'User not found' })
          done()
        })
    })
    */
  })

  /**
   * Test create user
   */
  describe('# Create user', () => { // eslint-disable-line
    it('Success to create user', done => { // eslint-disable-line
      env.chai.request(env.express)
        .post('/users')
        .send({
          name: 'Create user',
          email: 'create@user.com',
          password: 'create123',
          contract: 'nbj'
        })
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.has.status(201)
          res.body.should.have.property('auth').eql(true)
          res.body.should.have.property('token')
          done()
        })
    })

    it('Error by empty name', done => { // eslint-disable-line
      env.chai.request(env.express)
        .post('/users')
        .send({
          email: 'create@user.com',
          password: 'create123',
          contract: 'nbj'
        })
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.has.status(422)
          res.body.errors[0].should.have.property('location').eql('body')
          res.body.errors[0].should.have.property('param').eql('name')
          res.body.errors[0].should.have.property('msg').eql('Name is required')
          done()
        })
    })

    it('Error by empty email', done => { // eslint-disable-line
      env.chai.request(env.express)
        .post('/users')
        .send({
          name: 'Create user',
          password: 'create123',
          contract: 'nbj'
        })
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.has.status(422)
          res.body.errors[0].should.have.property('location').eql('body')
          res.body.errors[0].should.have.property('param').eql('email')
          res.body.errors[0].should.have.property('msg').eql('Email is required')
          done()
        })
    })

    it('Error by empty password', done => { // eslint-disable-line
      env.chai.request(env.express)
        .post('/users')
        .send({
          name: 'Create user',
          email: 'create@user.com',
          contract: 'nbj'
        })
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.has.status(422)
          res.body.errors[0].should.have.property('location').eql('body')
          res.body.errors[0].should.have.property('param').eql('password')
          res.body.errors[0].should.have.property('msg').eql('Password is required')
          done()
        })
    })

    it('Error by no user contract', done => { // eslint-disable-line
      env.chai.request(env.express)
        .post('/users')
        .send({
          name: 'Create user',
          email: 'create@user.com',
          password: 'create123'
        })
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.has.status(422)
          res.body.errors[0].should.have.property('location').eql('body')
          res.body.errors[0].should.have.property('param').eql('contract')
          res.body.errors[0].should.have.property('msg').eql('Contract is required')
          done()
        })
    })
  })

  /**
   * Test update user
   */
  describe('# Update user', () => { // eslint-disable-line
    it('Success to update user', done => { // eslint-disable-line
      env.chai.request(env.express)
        .put(`/users/${defaultUser().id.toString()}`)
        .set('x-access-token', defaultToken())
        .send({
          name: 'Updated name',
          email: 'updated@email.com'
        })
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.has.status(201)
          res.body.should.have.property('message').eql('User update successfully')
          done()
        })
    })

    it('Error to update user with no permission', done => { // eslint-disable-line
      env.chai.request(env.express)
        .put(`/users/${defaultUser().id.toString()}`)
        .set('x-access-token', lowPermToken())
        .send({
          name: 'Updated name',
          email: 'updated@email.com'
        })
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.has.status(403)
          res.body.should.have.property('errors').eql('User has no permission')
          done()
        })
    })

    it('Error to update user with no token', done => { // eslint-disable-line
      env.chai.request(env.express)
        .put(`/users/${defaultUser().id.toString()}`)
        .send({
          name: 'Updated name',
          email: 'updated@email.com'
        })
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.has.status(403)
          res.body.should.have.property('auth').eql(false)
          res.body.should.have.property('errors').eql('Token not provided.')
          done()
        })
    })

    it('Error to change password', done => { // eslint-disable-line
      env.chai.request(env.express)
        .put(`/users/${defaultUser().id.toString()}`)
        .set('x-access-token', lowPermToken())
        .send({
          password: 'password',
          newPassword: 'newPassword'
        })
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.has.status(403)
          res.body.should.have.property('errors').eql('User has no permission')
          // res.body.should.have.property('message').eql('To change password, use the path "/user/newpassword"')
          done()
        })
    })
  })

  /**
   * Test delete user
   */
  describe('# Delete user', () => { // eslint-disable-line
    it('Error to delete user with no permission', done => { // eslint-disable-line
      let id = defaultUser().id.toString()
      env.chai.request(env.express)
        .del(`/users/${id}`)
        .set('x-access-token', lowPermToken())
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.has.status(403)
          res.body.should.have.property('errors').eql(`User has no permission`)
          done()
        })
    })

    it('Error to delete user with no token', done => { // eslint-disable-line
      let id = defaultUser().id.toString()
      env.chai.request(env.express)
        .del(`/users/${id}`)
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.has.status(403)
          res.body.should.have.property('errors').eql(`Token not provided.`)
          done()
        })
    })

    it('Success to delete user', done => { // eslint-disable-line
      let id = defaultUser().id.toString()
      env.chai.request(env.express)
        .del(`/users/${id}`)
        .set('x-access-token', defaultToken())
        .end((err, res) => {
          if (err) logger.info(err)

          res.should.has.status(201)
          res.body.should.have.property('message').eql(`User id: ${id} deleted successfully`)
          done()
        })
    })
  })
})
