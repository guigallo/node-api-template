const env = require('./config/env');
const User = require('../models/User');
const assert = require('assert');
const should = env.should();
const logger = require('../services/logger');

let testUsers = '';
let defaultToken;
let lowToken;
describe('User routes', () => {
  before(done => {
    env.saveDefaultUser()
      .then(users => {
        testUsers = users;
        
        env.getDefaultUserToken()
        .then(defToken => {
          defaultToken = defToken

          env.getLowUserToken()
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
      env.chai.request(env.express)
        .get('/users')
        .set('x-access-token', defaultToken)
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.have.status(200);
          assert.deepEqual(res.body.result, [{
            id: testUsers[0]._id.toString(),
            name: 'Test user',
            email: 'mocha@test.com',
            permissions: ['user:create', 'user:read', 'user:update', 'user:delete']
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
      env.chai.request(env.express)
        .get('/users')
        .set('x-access-token', lowToken)
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.have.status(403);
          assert.deepEqual(res.body, { errors: 'User has no permission' });
          
          done();
        })
    });

    it('Get users without token', done => {
      env.chai.request(env.express)
        .get('/users')
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.have.status(403);
          assert.deepEqual(res.body, {
            auth: false,
            errors: "Token not provided."
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
      env.chai.request(env.express)
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
      env.chai.request(env.express)
        .get(`/users/${id}`)
        .set('x-access-token', lowToken)
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(403);
          assert.deepEqual(res.body, { errors: 'User has no permission' });
          done();
        })
    });

    it('Error to get users with no token', done => {
      let id = testUsers[1]._id.toString();
      env.chai.request(env.express)
        .get(`/users/${id}`)
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(403);
          res.body.should.have.property('auth').eql(false);
          res.body.should.have.property('errors').eql('Token not provided.');
          done();
        })
    });

    it('Search user not found', done => {
      env.chai.request(env.express)
        .get(`/users/invalidId`)
        .set('x-access-token', defaultToken)
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(404);
          assert.deepEqual(res.body, { errors: 'User not found' });
          done();
        });
    });
  });

  /**
   * Test create user
   */
  describe('# Create user', () => {
    it('Success to create user', done => {
      env.chai.request(env.express)
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
      env.chai.request(env.express)
        .post('/users')
        .send({
          email: 'create@user.com',
          password: 'create123'
        })
        .end((err, res) => {

          if(err) logger.info(err);

          res.should.has.status(422);
          res.body.errors[0].should.have.property('location').eql('body');
          res.body.errors[0].should.have.property('param').eql('name');
          res.body.errors[0].should.have.property('msg').eql('Name is required');
          done();
        });
    });

    it('Error by empty email', done => {
      env.chai.request(env.express)
        .post('/users')
        .send({
          name: 'Create user',
          password: 'create123'
        })
        .end((err, res) => {

          if(err) logger.info(err);

          res.should.has.status(422);
          res.body.errors[0].should.have.property('location').eql('body');
          res.body.errors[0].should.have.property('param').eql('email');
          res.body.errors[0].should.have.property('msg').eql('Email is required');
          done();
        });
    });

    it('Error by empty password', done => {
      env.chai.request(env.express)
        .post('/users')
        .send({
          name: 'Create user',
          email: 'create@user.com',
        })
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(422);
          res.body.errors[0].should.have.property('location').eql('body');
          res.body.errors[0].should.have.property('param').eql('password');
          res.body.errors[0].should.have.property('msg').eql('Password is required');
          done();
        });
    });
  });

  /**
   * Test update user
   */
  describe('# Update user', () => {
    it('Success to update user', done => {
      env.chai.request(env.express)
        .put(`/users/${testUsers[1]._id.toString()}`)
        .set('x-access-token', defaultToken)
        .send({
          name: 'Updated name',
          email: 'updated@email.com',
        })
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(201);
          res.body.should.have.property('message').eql('User update successfully');
          done();
        });
    });

    it('Error to update user with no permission', done => {
      env.chai.request(env.express)
        .put(`/users/${testUsers[1]._id.toString()}`)
        .set('x-access-token', lowToken)
        .send({
          name: 'Updated name',
          email: 'updated@email.com',
        })
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(403);
          res.body.should.have.property('errors').eql('User has no permission');
          done();
        });
    });

    it('Error to update user with no token', done => {
      env.chai.request(env.express)
        .put(`/users/${testUsers[1]._id.toString()}`)
        .send({
          name: 'Updated name',
          email: 'updated@email.com',
        })
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(403);
          res.body.should.have.property('auth').eql(false);
          res.body.should.have.property('errors').eql('Token not provided.');
          done();
        });
    });

    it('Error to change password', done => {
      env.chai.request(env.express)
        .put(`/users/${testUsers[1]._id.toString()}`)
        .set('x-access-token', defaultToken)
        .send({
          password: 'password',
          newPassword: 'newPassword'
        })
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(400);
          res.body.should.have.property('message').eql('To change password, use the path "/user/newpassword"');
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
      env.chai.request(env.express)
        .del(`/users/${id}`)
        .set('x-access-token', lowToken)
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(403);
          res.body.should.have.property('errors').eql(`User has no permission`);
          done();
        });
    });

    it('Error to delete user with no token', done => {
      let id = testUsers[1]._id.toString()
      env.chai.request(env.express)
        .del(`/users/${id}`)
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(403);
          res.body.should.have.property('errors').eql(`Token not provided.`);
          done();
        });
    });

    it('Success to delete user', done => {
      let id = testUsers[1]._id.toString()
      env.chai.request(env.express)
        .del(`/users/${id}`)
        .set('x-access-token', defaultToken)
        .end((err, res) => {
          if(err) logger.info(err);

          res.should.has.status(201);
          res.body.should.have.property('message').eql(`User id: ${id} deleted successfully`);
          done();
        });
    });
  });
});