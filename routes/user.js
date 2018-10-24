const PasswordsUtil = require('../utils/PasswordsUtil');
const userModel = require('../models/User');
const validaRequest = require('../validate/user');
const VerifyToken = require('../utils/VerifyToken');
const guard = require('express-jwt-permissions')();
const CreateToken = require('../utils/CreateToken');

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

        return res.status(200).send(usersFiltrado);
      })
  });

  app.get(ROTA + '/:id', VerifyToken, guard.check('user:write'), function(req, res) {
      userModel.findById( req.params.id, function(err, usuario) {
        if(err) return res.status(500).send('Houve um erro ao buscar os usuários');
        if(! usuario) return res.status(404).send('Nenhum usuário encontrado');
        
        return res.status(200).send({
          id: usuario._id,
          name: usuario.name,
          email: usuario.email,
        });
      });
  }); 

  app.post(ROTA, function(req, res) {
      console.log('Processando novo user');

      if(! validaRequest(req, res) ) return;

      //const hashedPassword = bcryptjs.hashSync(req.body.password, 8);
      const hashedPassword = PasswordsUtil.hashed(req.body.password);
      userModel.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        permissions: ['user']
      }, function(err, User) {
        if(err) return res.status(500).send('Houve um erro ao registrar o usuário');

        //extract to a function
        /*
        const payload = {
          id: User._id,
          permissions: User.permissions
        };
        const options = {
          expiresIn: 86400 //expires in 24 hours
        }
        const token = jwt.sign(payload, config.secret, options);
        */
        //
      const token = CreateToken(User._id, User.permissions);

        console.log('Usuário cadastrado com sucesso');
        res.status(201).send({ auth: true, token });
      })

      console.log('corpo: ' + req.body);
  });

  app.put(ROTA + '/:id', VerifyToken, guard.check('user:write'), function(req, res) {
      if(req.body.password || req.body.newPassword)
        return res.status(400).send('Use a rota "/user/newpassword" para alterar a senha');

      userModel.findByIdAndUpdate(req.params.id, req.body, (err, resposta) => {
        if(err) return res.status(500).send('Erro ao alterar usuário');

        return res.status(200).send('Usuário alterado com sucesso.');
      });
  });

  app.delete(ROTA + '/:id', VerifyToken, guard.check('user:write'), function(req, res) {
      userModel.findByIdAndDelete(req.params.id, function(err, usuario) {
        if(err) return res.status(500).send('Houve um erro ao buscar os usuários');
        
        return res.status(201).send('Usuário deletado com sucesso. Id: ' + req.params.id);
      });
  });
}