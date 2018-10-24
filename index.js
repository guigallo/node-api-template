const config = require('./config/config');
const app = require('./config/custom-express')();

app.listen(config.port, function() {
  console.log('Servidor rodando na porta ' + config.port);
})
