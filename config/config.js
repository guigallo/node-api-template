const port = process.env.PORT || 3001;

module.exports = {
  port:         port,

  dbAddress:    'localhost',
  dbPort:       '27017',
  dbDataBase:   'node-base-api',

  expireToken:  86400, // 24 hours

  secret:       'muitosecreto26+' // chanto to environment variable
};