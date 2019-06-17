require('dotenv/config')

const config = {
  /**
   * API
   */
  port: process.env.PORT || 3000,

  /**
   * DB
   */
  dbAddress: process.env.DB_ADDRESS,
  dbPort: process.env.DB_PORT,
  dbDataBase: process.env.DB_DATABASE,

  /**
   * Token
   */
  expireToken: process.env.EXPIRE_TOKEN, // 24 hours
  secret: process.env.SECRET,

  /**
   * User
   */
  annonCanCreate: process.env.ANNON_CAN_CREATE,
  permissionBy: process.env.PERMISSION_BY
}

module.exports = config
