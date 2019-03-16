const PERMISSION_BY = {
  ALL: 'PERM_ALL',
  OWNER: 'PERM_OWNER',
  COMPANY: 'PERM_COMPANY'
}

module.exports = {
  /**
   * API
   */
  port:           process.env.PORT || 3001,

  /**
   * DB
   */
  dbAddress:      'localhost',
  dbPort:         '27017',
  dbDataBase:     'node-base-api',

  /**
   * Token
   */
  expireToken:    86400, // 24 hours
  secret:         'muitosecreto26+', // change to environment variable

  /**
   * User
   */
  annonCanCreate: false,
  permissionBy:   PERMISSION_BY.ALL
}

module.exports.PERMISSION_BY = PERMISSION_BY