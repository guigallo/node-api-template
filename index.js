const config = require('./config/config');
const app = require('./config/express')();

const server = app.listen(config.port, function() {
  let usingPort = server.address().port;
  let usingHost = server.address().address;
  if (usingHost === '::')
    usingHost = 'localhost';

  console.log('App listening at http://%s:%s', usingHost, usingPort)
})

module.exports = app;