const PasswordsUtil = require('../utils/PasswordsUtil');
const userModel = require('../models/User');
const validaRequest = require('../validate/user');
const VerifyToken = require('../utils/VerifyToken');
const CreateToken = require('../utils/CreateToken');

const ROTA = '/log';

module.exports = function(app) {
  app.post(ROTA + '/in', function(req, res) {
    console.log('Logando usuário');
    
    if(! validaRequest(req, res, true) ) return;

    userModel.findOne({ email: req.body.email }, function(err, User) {
      if(err) return res.status(500).send('Erro no servidor');
      if(! User) return res.status(404).send('Usuário não encontrado');

      const passwordIsValid = PasswordsUtil.compare(req.body.password, User.password);
      if(! passwordIsValid) return res.status(401).send({ auth: false, token: null });

      const token = CreateToken(User._id, User.permissions);
      res.status(200).send({ auth: true, token });
    });
  });

  app.get(ROTA + '/me', VerifyToken, function(req, res) {
    userModel.findById(
      req.user.id,
      { password: 0 }, //projection
      function(err, user) {
        if(err) return res.status(500).send('Erro ao buscar usuário');
        if(! user) return res.status(404).send('Usuário não encontrado');

        res.status(200).send(user);
      }
    );
  });

  app.get(ROTA + '/out', function(req, res) {
    console.log('Usuário deslogado');
    res.status(200).send({ auth:false, token: null });
  });
  
  app.put(ROTA + '/newpassword', VerifyToken, function(req, res) {
    let pwOld = req.body.password;
    let pwNew = req.body.newPassword;
    console.log(req.user.id);

    if(pwOld === pwNew)
      return res.status(400).send('Escolha uma senha diferente da atual.');
    if(!pwOld || !pwNew)
      return res.status(400).send('Envie a senha atual e nova para trocar a senha.');

    let password = PasswordsUtil.hashed(pwNew);
    let passwordOld = PasswordsUtil.hashed(pwOld);

    userModel.findById(req.user.id, (err, user) => {
      if(err) return res.status(500).send('Usuário não encontrado');

      if(! user.password === passwordOld) 
        return res.status(400).send('A senha atual não está correta');
      
      userModel.findOneAndUpdate({ _id: req.user.id}, { password }, (err2, resposta) => {
        if(err2) return res.status(500).send('Erro ao alterar senha');

        return res.status(200).send('Senha alterada com sucesso.');
      });
    });
  });
}