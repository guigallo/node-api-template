const PasswordsUtil = require('../utils/PasswordsUtil');
const userModel = require('../models/User');
const validaRequest = require('../validate/user');
const CreateToken = require('../utils/CreateToken');
const logger = require('../services/logger');

module.exports = {
  getAllUsers(req, res) {
    userModel.find({}, function(err, usuarios) {
      if(err) return res.status(500).json({ message: 'Houve um erro ao buscar os usuários' });
      if(! usuarios) return res.status(404).json({ message: 'Nenhum usuário encontrado' });

      let usersFiltrado = [];
      usuarios.map(usuario => usersFiltrado.push({
          id: usuario._id,
          name: usuario.name,
          email: usuario.email,
          permissions: usuario.permissions
        })
      );

      logger.info('Todos usuários visualizados por: ' + req.user.id);
      return res.status(200).json(usersFiltrado);
    });
  },

  getUserById(req, res) {
    userModel.findById( req.params.id, function(err, usuario) {
      if(! usuario) return res.status(404).json({ message: 'Nenhum usuário encontrado' });
      if(err) return res.status(500).json({ message: 'Houve um erro ao buscar os usuários' });
      
      logger.info('Consulta de usuário feita por: ' + req.user.id);
      return res.status(200).json({
        id: usuario._id,
        name: usuario.name,
        email: usuario.email,
      });
    });
  },

  createUser(req, res) {
    if(! validaRequest(req, res) ) return;

    const hashedPassword = PasswordsUtil.hashed(req.body.password);
    userModel.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      permissions: ['user:read','user:write']
    }, function(err, User) {
      if(err) return res.status(500).json({ message: 'Houve um erro ao registrar o usuário' });

      const token = CreateToken(User._id, User.permissions);

      logger.info('Novo usuário cadastrado: ' + req.body.email);
      res.status(201).json({ auth: true, token });
    });
  },

  updateUser(req, res) {
    if(req.body.password || req.body.newPassword)
      return res.status(400).json({ message: 'Use a rota "/user/newpassword" para alterar a senha' });

    userModel.findByIdAndUpdate(req.params.id, req.body, (err, resposta) => {
      if(err) return res.status(500).json({ message: 'Erro ao alterar usuário' });

      logger.info('Usuário alterado: ' + req.params.id);
      return res.status(201).json({ message: 'Usuário alterado com sucesso.' });
    });
  },

  deleteUser(req, res) {
    userModel.findByIdAndDelete(req.params.id, function(err, usuario) {
      if(err) return res.status(500).json({ message: 'Houve um erro ao buscar os usuários' });
      
      logger.info({ message: 'Usuário deletado: ' + req.params.id + ' pelo usuário: ' + req.user.id });
      return res.status(201).json({ message: 'Usuário deletado com sucesso. Id: ' + req.params.id });
    });
  }
}