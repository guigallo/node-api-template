module.exports = {
  /**
   * API Config
   */
  port:         process.env.PORT || 3001,

  /**
   * DB Config
   */
  dbAddress:    'localhost',
  dbPort:       '27017',
  dbDataBase:   'node-base-api',

  /**
   * Token Config
   */
  expireToken:  86400, // 24 hours
  secret:       'muitosecreto26+', // change to environment variable

  /**
   * User Config
   */
  byContract:   true,
  byOwner:      false,
  byCompany:    true
}