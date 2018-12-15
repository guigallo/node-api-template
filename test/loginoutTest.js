const helper = require('../helper/testHelper');
const User = require('../models/User');
const should = helper.should();

let testUsers = '';
let token = '';

describe('Log in/out', () => {
  before(done => {
    helper.saveDefaultUser()
      .then(users => {
        testUsers = users;
        done();
      })
      .catch(err => console.log(err));
  });
  
  after(done => {
    User.deleteMany({}, err => {
      done();
    })
  });

  /**
   * Test the log in
   */
  describe('# Log In', () => {
    it('it should log in', done => {
      helper.chai.request(helper.express)
        .post('/log/in')
        .send({ 
          email: helper.defaultUser.email,
          password: helper.defaultUser.password
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('auth').eql(true);
          res.body.should.have.property('token');
          token = res.body.token;
          done();
        });
    });

    it('try to log in with wrong password', done => {
      helper.chai.request(helper.express)
        .post('/log/in')
        .send({
          email: helper.defaultUser.email,
          password: 'wrong123456'
        })
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.have.property('auth').eql(false);
          res.body.should.have.property('token').eql(null);
          done();
        });
    });

    it('try to log in with no parameters', done => {
      helper.chai.request(helper.express)
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
  describe('# Log Me', () => {
    it('get user data with token', done => {
      helper.chai.request(helper.express)
        .get('/log/me')
        .set('x-access-token', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.have.property('body');
          res.body.should.have.property('_id').to.equal(testUsers[0]._id.toString());
          res.body.should.have.property('name').eql(helper.defaultUser.name);
          res.body.should.have.property('email').eql(helper.defaultUser.email);
          done();
        });
    });

    it('try to get data with invalid token', done => {
      helper.chai.request(helper.express)
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
      helper.chai.request(helper.express)
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
  describe('# Log Out', () => {
    it('log out an authenticated user', done => {
      helper.chai.request(helper.express)
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
  describe('# Change password', () => {
    it('changing password with no token', done => {
      helper.chai.request(helper.express)
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
      helper.chai.request(helper.express)
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
      helper.chai.request(helper.express)
        .put('/log/newpassword')
        .set('x-access-token', token)
        .send({ newPassword: helper.defaultUser.newPassword })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('message').eql('Envie a senha atual e nova para trocar a senha.');
          done();
        });
    });

    it('changing password whithout sent new password', done => {
      helper.chai.request(helper.express)
        .put('/log/newpassword')
        .set('x-access-token', token)
        .send({ password: helper.defaultUser.password })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('message').eql('Envie a senha atual e nova para trocar a senha.');
          done();
        });
    });

    it('changing password with current and new passwords equals', done => {
      helper.chai.request(helper.express)
        .put('/log/newpassword')
        .set('x-access-token', token)
        .send({
          password: helper.defaultUser.newPassword,
          newPassword: helper.defaultUser.newPassword
        })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('message').eql('Escolha uma senha diferente da atual.');
          done();
        })
    });

    it('changing password with invalid current password', done => {
      helper.chai.request(helper.express)
        .put('/log/newpassword')
        .set('x-access-token', token)
        .send({
          password: 'senhaErrada',
          newPassword: helper.defaultUser.newPassword
        })
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('message').eql('A senha atual não está correta.');
          done();
        })
    });

    it('it should change password', done => {
      helper.chai.request(helper.express)
        .put('/log/newpassword')
        .set('x-access-token', token)
        .send({
          password: helper.defaultUser.password,
          newPassword: helper.defaultUser.newPassword
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('message').eql('Senha alterada com sucesso.');
          done();
        });
    });
  });
});
