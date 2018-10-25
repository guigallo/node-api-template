process.env.NODE_ENV = 'test';

const User = require('../models/User');
const PasswordsUtil = require('../utils/PasswordsUtil')

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const should = chai.should();
chai.use(chaiHttp);

const name = 'Test user';
const email = 'mocha@test.com';
const password = 'test123456';
const newPassword = 'new123456'
let id = '';
let token = '';

describe('Log in/out', () => {
  before(done => {
    User.deleteMany({}, err => {

      const user = new User({
        name, email,
        password: PasswordsUtil.hashed(password)
      });
      
      user.save((err, user) => {
        id = user._id;
        done();
      });
    });
  });

  after(done => {
    User.deleteMany({}, err => {
      done();
    })
  })

  /**
   * Test the log in
   */
  describe('#Log In', () => {
    it('it should log in', done => {
      chai.request(server)
        .post('/log/in')
        .send({ email, password })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('auth').eql(true);
          res.body.should.have.property('token');
          token = res.body.token;
          done();
        });
    });

    it('try to log in with wrong password', done => {
      chai.request(server)
        .post('/log/in')
        .send({ email, password: 'wrong123456' })
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.have.property('auth').eql(false);
          res.body.should.have.property('token').eql(null);
          done();
        });
    });

    it('try to log in with no parameters', done => {
      chai.request(server)
        .post('/log/in')
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          res.should.have.property('body');
          res.body[0].should.have.any.key('param', 'msg');
          res.body[1].should.have.any.key('param', 'msg');
          done();
        });
    });
  });

  /**
   * Test the log me
   */
  describe('#Log Me', () => {
    it('get user data with token', done => {
      chai.request(server)
        .get('/log/me')
        .set('x-access-token', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.have.property('body');
          res.body.should.have.property('_id').to.equal(id.toString());
          res.body.should.have.property('name').eql(name);
          res.body.should.have.property('email').eql(email);
          done();
        });
    });

    it('try to get data with invalid token', done => {
      chai.request(server)
        .get('/log/me')
        .set('x-access-token', token + 12312)
        .end((err, res) => {
          res.should.have.status(500);
          res.should.have.property('body');
          res.body.should.have.property('auth').eql(false);
          res.body.should.have.property('message').eql('Falha ao autenticar o token.');
          done();
        });
    });

    it('try to get date with no token', done => {
      chai.request(server)
        .get('/log/me')
        .end((err, res) => {
          res.should.have.status(403);
          res.should.have.property('body');
          res.body.should.have.property('auth').eql(false);
          res.body.should.have.property('message').eql('Nenhum token fornecido.');
          done();
        });
    });
  });

  /**
   * Test the log out
   */
  describe('#Log Out', () => {
    it('log out an authenticated user', done => {
      chai.request(server)
        .get('/log/out')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.have.property('body');
          res.body.should.have.property('auth').eql(false);
          res.body.should.have.property('token').eql(null);
          done();
        });
    });
  });

  /**
   * Teste the log change password
   */
  describe('#Change password to log in', () => {
    it('changing password with no token', done => {
      chai.request(server)
        .put('/log/newpassword')
        .end((err, res) => {
          res.should.have.status(403);
          res.should.have.property('body');
          res.body.should.have.property('auth').eql(false);
          res.body.should.have.property('message').eql('Nenhum token fornecido.');
          done();
        });
    });

    it('changing password with invalid token', done => {
      chai.request(server)
        .put('/log/newpassword')
        .set('x-access-token', token + 12312)
        .end((err, res) => {
          res.should.have.status(500);
          res.should.have.property('body');
          res.body.should.have.property('auth').eql(false);
          res.body.should.have.property('message').eql('Falha ao autenticar o token.');
          done();
        });
    });

    it('changing password without sent current password', done => {
      chai.request(server)
        .put('/log/newpassword')
        .set('x-access-token', token)
        .send({ newPassword })
        .end((err, res) => {
          res.should.have.status(400);
          res.should.have.property('text').eql('Envie a senha atual e nova para trocar a senha.');
          done();
        });
    });

    it('changing password whithout sent new password', done => {
      chai.request(server)
        .put('/log/newpassword')
        .set('x-access-token', token)
        .send({ password })
        .end((err, res) => {
          res.should.have.status(400);
          res.should.have.property('text').eql('Envie a senha atual e nova para trocar a senha.');
          done();
        });
    });

    it('changing password with current and new passwords equals', done => {
      chai.request(server)
        .put('/log/newpassword')
        .set('x-access-token', token)
        .send({ password: newPassword, newPassword})
        .end((err, res) => {
          res.should.have.status(400);
          res.should.have.property('text').eql('Escolha uma senha diferente da atual.');
          done();
        })
    });

    it('changing password with invalid current password', done => {
      chai.request(server)
        .put('/log/newpassword')
        .set('x-access-token', token)
        .send({ password: 'senhaErrada', newPassword})
        .end((err, res) => {
          res.should.have.status(400);
          res.should.have.property('text').eql('A senha atual não está correta.');
          done();
        })
    });

    it('it should change password', done => {
      chai.request(server)
        .put('/log/newpassword')
        .set('x-access-token', token)
        .send({ password, newPassword })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.have.property('text').eql('Senha alterada com sucesso.');
          done();
        });
    });
  });
});