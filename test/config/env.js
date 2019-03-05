process.env.NODE_ENV = 'test';
const chai = require('chai');
const http = require('chai-http');
const UserModel = require('../../models/User');
const passwordsUtil = require('../../utils/PasswordsUtil');
const logger = require('../../services/logger');
const getToken = require('../helper/getToken');

chai.use(http);

const defaultUser = {
  name: 'Test user',
  email: 'mocha@test.com',
  password: 'test123456',
  newPassword: 'new123456',
  permissions: ['user:create', 'user:read', 'user:update', 'user:delete']
},
lowPermissionUser = {
  name: 'Low permission user',
  email: 'low@permission.com',
  password: 'test123456',
  newPassword: 'new123456',
  permissions: ['nothing']
}

let defaultToken;
function getDefaultUserToken() {
  getToken(defaultUser)
    .then(token => defaultToken = token)
    .catch(err => logger.info(err));
}

let lowToken;
function getLowUserToken() {
  getToken(lowPermissionUser)
    .then(token => { return token })
    .catch(err => logger.info(err));
}

module.exports = {
  chai,
  should: chai.should,
  express: require('../../index'),
  passwordsUtil,

  defaultUser,
  defaultToken,
  lowToken,
  
  getDefaultUserToken() {
    return getToken(defaultUser);
  },
  
  getLowUserToken() {
    return getToken(lowPermissionUser);
  },

  saveDefaultUser() {
    return new Promise((resolve, reject) => {
      const defUser = new UserModel({
        name: defaultUser.name,
        email: defaultUser.email,
        password: passwordsUtil.hashed(defaultUser.password),
        permissions: defaultUser.permissions
      });
      const lowUser = new UserModel({
        name: lowPermissionUser.name,
        email: lowPermissionUser.email,
        password: passwordsUtil.hashed(lowPermissionUser.password),
        permissions: lowPermissionUser.permissions
      });

      UserModel.insertMany([defUser, lowUser], function(err, saved) {
        if(err) logger.info(err);
        resolve(saved);
      });
    });
  }
}