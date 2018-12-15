const helper = require('../helper/testHelper');
const User = require('../models/User');
const assert = require('assert');
const should = helper.should();
const logger = require('../services/logger');

let testUsers = '';
let defaultToken;
let lowToken;
describe('User routes', () => {
  before(done => {
    helper.saveDefaultUser()
      .then(users => {
        testUsers = users;
        
        helper.getDefaultUserToken()
        .then(defToken => {
          defaultToken = defToken

          helper.getLowUserToken()
            .then(lToken => {
              lowToken = lToken;
              done()
            })
        });
      })
      .catch(err => logger.info(err));
  });
  
  after(done => {
    User.deleteMany({}, err => {
      done();
    })
  });

  /**
   * Test GET users
   */
  describe('# GET users', () => {
    it('Get array of users', done => {
      helper.chai.request(helper.express)
        .get('/users')
        .set('x-access-token', defaultToken)
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.have.status(200);
          assert.deepEqual(res.body, [{
            id: testUsers[0]._id.toString(),
            name: 'Test user',
            email: 'mocha@test.com',
            permissions: ['user:read', 'user:write']
          },{
            id: testUsers[1]._id.toString(),
            name: 'Low permission user',
            email: 'low@permission.com',
            permissions: ['nothing']
          }]);
          done();
        })
    });

    it('Get users with no permission', done => {
      helper.chai.request(helper.express)
        .get('/users')
        .set('x-access-token', lowToken)
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.have.status(500);
          assert.deepEqual(res.body, { message: 'Internal error.' });
          
          done();
        })
    });

    it('Get users without token', done => {
      helper.chai.request(helper.express)
        .get('/users')
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.have.status(403);
          assert.deepEqual(res.body, {
            auth: false,
            message: "Nenhum token fornecido."
          });
          done()
        });
    });
  });

  /**
   * Test GET user by ID
   */
  describe('# GET user by ID', () => {
    it('Success to GET user by ID', done => {
      let id = testUsers[0]._id.toString();
      helper.chai.request(helper.express)
        .get(`/users/${id}`)
        .set('x-access-token', defaultToken)
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(200);
          assert.deepEqual(res.body, {
            id,
            name: 'Test user',
            email: 'mocha@test.com'
          });
          done();
        })
    });

    it('Error to get users with no permission', done => {
      let id = testUsers[1]._id.toString();
      helper.chai.request(helper.express)
        .get(`/users/${id}`)
        .set('x-access-token', lowToken)
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(500);
          assert.deepEqual(res.body, { message: 'Internal error.' });
          done();
        })
    });

    it('Error to get users with no token', done => {
      let id = testUsers[1]._id.toString();
      helper.chai.request(helper.express)
        .get(`/users/${id}`)
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(403);
          res.body.should.have.property('auth').eql(false);
          res.body.should.have.property('message').eql('Nenhum token fornecido.');
          done();
        })
    });

    it('Search user not found', done => {
      helper.chai.request(helper.express)
        .get(`/users/invalidId`)
        .set('x-access-token', defaultToken)
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(404);
          assert.deepEqual(res.body, { message: 'Nenhum usuário encontrado' });
          done();
        });
    });
  });

  /**
   * Test create user
   */
  describe('# Create user', () => {
    it('Success to create user', done => {
      helper.chai.request(helper.express)
        .post('/users')
        .send({
          name: 'Create user',
          email: 'create@user.com',
          password: 'create123'
        })
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(201);
          res.body.should.have.property('auth').eql(true);
          res.body.should.have.property('token');
          done();
        });
    });

    it('Error by empty name', done => {
      helper.chai.request(helper.express)
        .post('/users')
        .send({
          email: 'create@user.com',
          password: 'create123'
        })
        .end((err, res) => {

          if(err) logger.info(err);

          res.should.has.status(400);
          res.body[0].should.have.property('location').eql('params');
          res.body[0].should.have.property('param').eql('name');
          res.body[0].should.have.property('msg').eql('Nome é obrigatório.');
          done();
        });
    });

    it('Error by empty email', done => {
      helper.chai.request(helper.express)
        .post('/users')
        .send({
          name: 'Create user',
          password: 'create123'
        })
        .end((err, res) => {

          if(err) logger.info(err);

          res.should.has.status(400);
          res.body[0].should.have.property('location').eql('params');
          res.body[0].should.have.property('param').eql('email');
          res.body[0].should.have.property('msg').eql('Email é obrigatório.');
          done();
        });
    });

    it('Error by empty password', done => {
      helper.chai.request(helper.express)
        .post('/users')
        .send({
          name: 'Create user',
          email: 'create@user.com',
        })
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(400);
          res.body[0].should.have.property('location').eql('params');
          res.body[0].should.have.property('param').eql('password');
          res.body[0].should.have.property('msg').eql('Senha é obrigatória.');
          done();
        });
    });
  });

  /**
   * Test update user
   */
  describe('# Update user', () => {
    it('Success to update user', done => {
      helper.chai.request(helper.express)
        .put(`/users/${testUsers[1]._id.toString()}`)
        .set('x-access-token', defaultToken)
        .send({
          name: 'Updated name',
          email: 'updated@email.com',
        })
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(201);
          res.body.should.have.property('message').eql('Usuário alterado com sucesso.');
          done();
        });
    });

    it('Error to update user with no permission', done => {
      helper.chai.request(helper.express)
        .put(`/users/${testUsers[1]._id.toString()}`)
        .set('x-access-token', lowToken)
        .send({
          name: 'Updated name',
          email: 'updated@email.com',
        })
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(500);
          res.body.should.have.property('message').eql('Internal error.');
          done();
        });
    });

    it('Error to update user with no token', done => {
      helper.chai.request(helper.express)
        .put(`/users/${testUsers[1]._id.toString()}`)
        .send({
          name: 'Updated name',
          email: 'updated@email.com',
        })
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(403);
          res.body.should.have.property('auth').eql(false);
          res.body.should.have.property('message').eql('Nenhum token fornecido.');
          done();
        });
    });

    it('Error to change password', done => {
      helper.chai.request(helper.express)
        .put(`/users/${testUsers[1]._id.toString()}`)
        .set('x-access-token', defaultToken)
        .send({
          password: 'password',
          newPassword: 'newPassword'
        })
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(400);
          res.body.should.have.property('message').eql('Use a rota "/user/newpassword" para alterar a senha');
          done();
        });
    });
  });

  /**
   * Test delete user
   */
  describe('# Delete user', () => {
    it('Error to delete user with no permission', done => {
      let id = testUsers[1]._id.toString()
      helper.chai.request(helper.express)
        .del(`/users/${id}`)
        .set('x-access-token', lowToken)
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(500);
          res.body.should.have.property('message').eql(`Internal error.`);
          done();
        });
    });

    it('Error to delete user with no token', done => {
      let id = testUsers[1]._id.toString()
      helper.chai.request(helper.express)
        .del(`/users/${id}`)
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(403);
          res.body.should.have.property('message').eql(`Nenhum token fornecido.`);
          done();
        });
    });

    it('Success to delete user', done => {
      let id = testUsers[1]._id.toString()
      helper.chai.request(helper.express)
        .del(`/users/${id}`)
        .set('x-access-token', defaultToken)
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(201);
          res.body.should.have.property('message').eql(`Usuário deletado com sucesso. Id: ${id}`);
          done();
        });
    });
  });
});