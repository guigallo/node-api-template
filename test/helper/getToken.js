const UserModel = require('../../models/User');
const CreateToken = require('../../utils/CreateToken');
const passwordsUtil = require('../../utils/PasswordsUtil');

module.exports = (user) => {
  return new Promise((resolve, reject) => {
    UserModel.findOne({ email: user.email }, function(err, User) {
      if(err) reject('Internal error');
      if(! User) reject('User not found');
  
      const passwordIsValid = passwordsUtil.compare(user.password, User.password);
      if(! passwordIsValid) reject('Invalid password');

      resolve(CreateToken(User._id, User.permissions));
    });
  });
}