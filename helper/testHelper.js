process.env.NODE_ENV = 'test';

const chai = require('chai');
const http = require('chai-http');
chai.use(http);
module.exports = {
  chai,
  should: chai.should,
  express: require('../index'),
  passwordsUtil: require('../utils/PasswordsUtil'),

  defaultUser: {
    name: 'Test user',
    email: 'mocha@test.com',
    password: 'test123456',
    newPassword: 'new123456'
  }
}