const UserModel = require('../../models/User')
const CreateToken = require('../../utils/CreateToken')
const passwordsUtil = require('../../utils/PasswordsUtil')

module.exports = (user) => {
  return new Promise((resolve, reject) => {
    UserModel.findOne({ email: user.email }, function (err, User) {
      if (err) reject(new Error('Internal error'))
      if (!User) reject(new Error('User not found'))

      const passwordIsValid = passwordsUtil.compare(user.password, User.password)
      if (!passwordIsValid) reject(new Error('Invalid password'))

      resolve(CreateToken({ id: User._id, permissions: User.permissions, contract: User.contract }))
    })
  })
}
