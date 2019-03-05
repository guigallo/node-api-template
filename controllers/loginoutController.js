const PasswordsUtil = require('../utils/PasswordsUtil')
const userModel = require('../models/User')
const validaRequest = require('../middlewares/validateUser') // deprecated
const CreateToken = require('../utils/CreateToken')
const logger = require('../services/logger')

module.exports = {
  login(req, res) {
    if(! validaRequest(req, res, true)) return

    userModel.findOne({ email: req.body.email }, (err, User) => {
      if(err) return res.status(500).json({ message: 'Erro no servidor'})
      if(! User) return res.status(404).json({ message: 'Usuário não encontrado'})

      const passwordIsValid = PasswordsUtil.compare(req.body.password, User.password)
      if(! passwordIsValid) return res.status(401).json({ auth: false, token: null })

      logger.info('Usuário logado: ' + User._id)
      const token = CreateToken(User._id, User.permissions)
      res.status(200).json({ auth: true, token })
    })
  },

  userData(req, res) {
    userModel.findById(
      req.user.id,
      { password: 0 }, //projection
      (err, user) => {
        if(err) return res.status(500).json({ message: 'Erro ao buscar usuário'})
        if(! user) return res.status(404).json({ message: 'Usuário não encontrado'})

        logger.info('Usuário retornado: ' + user._id)
        res.status(200).json(user)
      }
    )
  },

  logout(req, res) {
    logger.info('Usuário deslogado')
    res.status(200).json({ auth:false, token: null })
  },

  newPassword(req, res) {
    let pwOld = req.body.password
    let pwNew = req.body.newPassword

    if(pwOld === pwNew) return res.status(400).json({ message: 'Escolha uma senha diferente da atual.'})
    if(!pwOld || !pwNew) return res.status(400).json({ message: 'Envie a senha atual e nova para trocar a senha.'})

    userModel.findById(req.user.id, (err, user) => {
      if(err) return res.status(404).json({ message: 'Usuário não encontrado'})
      
      if(! PasswordsUtil.compare(pwOld, user.password))
      return res.status(403).json({ message: 'A senha atual não está correta.'})
      
      let password = PasswordsUtil.hashed(pwNew)
      userModel.findOneAndUpdate({ _id: req.user.id}, { password }, (err2, resposta) => {
        if(err2) return res.status(500).json({ message: 'Erro ao alterar senha'})

        logger.info('Senha alterada do usuário: ' + user._id)
        return res.status(200).json({ message: 'Senha alterada com sucesso.'})
      });
    });
  }
}