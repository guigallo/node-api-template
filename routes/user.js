const PasswordsUtil = require('../utils/PasswordsUtil');
const userModel = require('../models/User');
const validaRequest = require('../validate/user');
const VerifyToken = require('../utils/VerifyToken');
const guard = require('express-jwt-permissions')();
const CreateToken = require('../utils/CreateToken');

const logger = require('../services/logger');

const ROTA = '/user';

module.exports = function(app) {
  app.get(ROTA, VerifyToken, guard.check('user:read'), function(req, res) {
      userModel.find({}, function(err, usuarios) {
        if(err) return res.status(500).send('Houve um erro ao buscar os usuários');
        if(! usuarios) return res.status(404).send('Nenhum usuário encontrado');

        let usersFiltrado = [];
        usuarios.map(usuario => usersFiltrado.push({
            id: usuario._id,
            name: usuario.name,
            email: usuario.email,
          })
        );

        logger.info('Todos usuários visualizados por: ' + req.user.id);
        return res.status(200).send(usersFiltrado);
      })
  });

  app.get(ROTA + '/:id', VerifyToken, guard.check('user:write'), function(req, res) {
      userModel.findById( req.params.id, function(err, usuario) {
        if(err) return res.status(500).send('Houve um erro ao buscar os usuários');
        if(! usuario) return res.status(404).send('Nenhum usuário encontrado');
        
        logger.info('Consulta de usuário feita por: ' + req.user.id);
        return res.status(200).send({
          id: usuario._id,
          name: usuario.name,
          email: usuario.email,
        });
      });
  }); 

  app.post(ROTA, function(req, res) {
      if(! validaRequest(req, res) ) return;

      const hashedPassword = PasswordsUtil.hashed(req.body.password);
      userModel.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        permissions: ['user']
      }, function(err, User) {
        if(err) return res.status(500).send('Houve um erro ao registrar o usuário');

        const token = CreateToken(User._id, User.permissions);

        logger.info('Novo usuário cadastrado: ' + req.body.email);
        res.status(201).send({ auth: true, token });
      });
  });

  app.put(ROTA + '/:id', VerifyToken, guard.check('user:write'), function(req, res) {
      if(req.body.password || req.body.newPassword)
        return res.status(400).send('Use a rota "/user/newpassword" para alterar a senha');

      userModel.findByIdAndUpdate(req.params.id, req.body, (err, resposta) => {
        if(err) return res.status(500).send('Erro ao alterar usuário');

        logger.info('Usuário alterado: ' + req.params.id);
        return res.status(200).send('Usuário alterado com sucesso.');
      });
  });

  app.delete(ROTA + '/:id', VerifyToken, guard.check('user:write'), function(req, res) {
      userModel.findByIdAndDelete(req.params.id, function(err, usuario) {
        if(err) return res.status(500).send('Houve um erro ao buscar os usuários');
        
        logger.info('Usuário deletado: ' + req.params.id + ' pelo usuário: ' + req.user.id);
        return res.status(201).send('Usuário deletado com sucesso. Id: ' + req.params.id);
      });
  });
}