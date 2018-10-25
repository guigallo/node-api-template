const logger = require('../services/logger');

function validaRequest(req, res, login = false) {
  if (! login)
    req.assert('name', 'Nome é obrigatório.').notEmpty();
  req.assert('email', 'Email é obrigatório.').notEmpty();
  req.assert('password', 'Senha é obrigatória.').notEmpty();
  
  const errors = req.validationErrors();
  if( errors ){
    logger.info('Erro de validação: ' + errors);
    res.status(400).send(errors);
    return false;
  }

  return true;
}

module.exports = validaRequest;