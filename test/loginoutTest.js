const env = require('./config/env')
const User = require('../models/User')
const should = env.should()

let testUsers = ''
let token = ''
module.exports = describe('Log in/out', () => {
  before(done => {
    env.saveDefaultUser()
      .then(users => {
        testUsers = users
        done()
      })
      .catch(err => console.log(err))
  })
  
  after(done => {
    User.deleteMany({}, err => {
      done()
    })
  })

  describe('# Log In', () => {
    it('it should log in', done => {
      env.chai.request(env.express)
        .post('/log/in')
        .send({ 
          email: env.defaultUser.email,
          password: env.defaultUser.password
        })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.have.property('auth').eql(true)
          res.body.should.have.property('token')
          token = res.body.token
          done()
        })
    })

    it('try to log in with wrong password', done => {
      env.chai.request(env.express)
        .post('/log/in')
        .send({
          email: env.defaultUser.email,
          password: 'wrong123456'
        })
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.have.property('auth').eql(false)
          res.body.should.have.property('token').eql(null)
          done()
        })
    })

    it('try to log in with no parameters', done => {
      env.chai.request(env.express)
        .post('/log/in')
        .send({})
        .end((err, res) => {
          res.should.have.status(400)
          res.should.have.property('body')
          res.body[0].should.have.any.key('param', 'msg')
          res.body[1].should.have.any.key('param', 'msg')
          done()
        })
    })
  })

  describe('# Log Me', () => {
    it('get user data with token', done => {
      env.chai.request(env.express)
        .get('/log/me')
        .set('x-access-token', token)
        .end((err, res) => {
          res.should.have.status(200)
          res.should.have.property('body')
          res.body.should.have.property('_id').to.equal(testUsers[0]._id.toString())
          res.body.should.have.property('name').eql(env.defaultUser.name)
          res.body.should.have.property('email').eql(env.defaultUser.email)
          done()
        })
    })

    it('try to get data with invalid token', done => {
      env.chai.request(env.express)
        .get('/log/me')
        .set('x-access-token', token + 12312)
        .end((err, res) => {
          res.should.have.status(401)
          res.should.have.property('body')
          res.body.should.have.property('auth').eql(false)
          res.body.should.have.property('errors').eql('JsonWebTokenError')
          done()
        })
    })

    it('try to get date with no token', done => {
      env.chai.request(env.express)
        .get('/log/me')
        .end((err, res) => {
          res.should.have.status(403)
          res.should.have.property('body')
          res.body.should.have.property('auth').eql(false)
          res.body.should.have.property('errors').eql('Token not provided.')
          done()
        })
    })
  })

  describe('# Log Out', () => {
    it('log out an authenticated user', done => {
      env.chai.request(env.express)
        .get('/log/out')
        .end((err, res) => {
          res.should.have.status(200)
          res.should.have.property('body')
          res.body.should.have.property('auth').eql(false)
          res.body.should.have.property('token').eql(null)
          done()
        })
    })
  })

  describe('# Change password', () => {
    it('changing password with no token', done => {
      env.chai.request(env.express)
        .put('/log/newpassword')
        .end((err, res) => {
          res.should.have.status(403)
          res.should.have.property('body')
          res.body.should.have.property('auth').eql(false)
          res.body.should.have.property('errors').eql('Token not provided.')
          done()
        })
    })

    it('changing password with invalid token', done => {
      env.chai.request(env.express)
        .put('/log/newpassword')
        .set('x-access-token', token + 12312)
        .end((err, res) => {
          res.should.have.status(401)
          res.should.have.property('body')
          res.body.should.have.property('auth').eql(false)
          res.body.should.have.property('errors').eql('JsonWebTokenError')
          done()
        })
    })

    it('changing password without sent current password', done => {
      env.chai.request(env.express)
        .put('/log/newpassword')
        .set('x-access-token', token)
        .send({ newPassword: env.defaultUser.newPassword })
        .end((err, res) => {
          res.should.have.status(400)
          res.body.should.have.property('message').eql('Envie a senha atual e nova para trocar a senha.')
          done()
        })
    })

    it('changing password whithout sent new password', done => {
      env.chai.request(env.express)
        .put('/log/newpassword')
        .set('x-access-token', token)
        .send({ password: env.defaultUser.password })
        .end((err, res) => {
          res.should.have.status(400)
          res.body.should.have.property('message').eql('Envie a senha atual e nova para trocar a senha.')
          done()
        })
    })

    it('changing password with current and new passwords equals', done => {
      env.chai.request(env.express)
        .put('/log/newpassword')
        .set('x-access-token', token)
        .send({
          password: env.defaultUser.newPassword,
          newPassword: env.defaultUser.newPassword
        })
        .end((err, res) => {
          res.should.have.status(400)
          res.body.should.have.property('message').eql('Escolha uma senha diferente da atual.')
          done()
        })
    })

    it('changing password with invalid current password', done => {
      env.chai.request(env.express)
        .put('/log/newpassword')
        .set('x-access-token', token)
        .send({
          password: 'senhaErrada',
          newPassword: env.defaultUser.newPassword
        })
        .end((err, res) => {
          res.should.have.status(403)
          res.body.should.have.property('message').eql('A senha atual não está correta.')
          done()
        })
    })

    it('it should change password', done => {
      env.chai.request(env.express)
        .put('/log/newpassword')
        .set('x-access-token', token)
        .send({
          password: env.defaultUser.password,
          newPassword: env.defaultUser.newPassword
        })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.have.property('message').eql('Senha alterada com sucesso.')
          done()
        })
    })
  })
})
