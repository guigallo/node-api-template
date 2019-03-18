process.env.NODE_ENV = 'test'
const chai = require('chai')
const http = require('chai-http')
const UserModel = require('../../models/User')
const CompanyModel = require('../../models/Company')
const passwordsUtil = require('../../utils/PasswordsUtil')
const logger = require('../../services/logger')
const getToken = require('../helper/getToken')

chai.use(http)

const defaultCompany = { name: 'Empresa' }

const defaultUserMock = {
  name: 'Test user',
  email: 'mocha@test.com',
  password: 'test123456',
  newPassword: 'new123456',
  permissions: ['user:create', 'user:read', 'user:update', 'user:delete'],
  contract: 'nbj'
}
const lowPermissionUserMock = {
  name: 'Low permission user',
  email: 'low@permission.com',
  password: 'test123456',
  newPassword: 'new123456',
  permissions: ['nothing'],
  contract: 'nbj'
}

async function saveDefaultCompany () {
  return new Promise(resolve => {
    const companyModel = new CompanyModel({ name: defaultCompany.name })
    CompanyModel.create(companyModel, (err, created) => {
      if (err) logger.info(err)
      resolve(created)
    })
  })
}

async function saveDefaultUsers () {
  const company = await saveDefaultCompany()

  return new Promise(resolve => {
    const defUser = new UserModel({
      name: defaultUserMock.name,
      email: defaultUserMock.email,
      password: passwordsUtil.hashed(defaultUserMock.password),
      permissions: defaultUserMock.permissions,
      contract: defaultUserMock.contract,
      companies: [ company ]
    })
    const lowUser = new UserModel({
      name: lowPermissionUserMock.name,
      email: lowPermissionUserMock.email,
      password: passwordsUtil.hashed(lowPermissionUserMock.password),
      permissions: lowPermissionUserMock.permissions,
      contract: lowPermissionUserMock.contract,
      companies: []
    })

    UserModel.insertMany([defUser, lowUser], function (err, saved) {
      if (err) logger.info(err)
      resolve({ users: saved, company })
    })
  })
}

module.exports = {
  chai,
  should: chai.should,
  express: require('../../index'),
  passwordsUtil,
  defaultUserMock,
  lowPermissionUserMock,

  saveDefUsersAndGetTokens: async () => {
    const { users, company } = await saveDefaultUsers()

    const defaultUser = users.find(user => { return user.email === defaultUserMock.email })
    const defaultUserToken = await getToken(defaultUserMock)

    const lowPermissionUser = users.find(user => { return user.email === lowPermissionUserMock.email })
    const lowPermissionToken = await getToken(lowPermissionUserMock)

    return new Promise(resolve => resolve({
      defaultUser,
      defaultUserToken,
      lowPermissionUser,
      lowPermissionToken,
      company
    }))
  }
}
