const bcryptjs = require('bcryptjs');

class PasswordsUtil {
  hashed(senha) {
    return bcryptjs.hashSync(senha, 8);
  }
  
  compare(senha1, senha2) {
    return bcryptjs.compareSync(senha1, senha2);
  }
}

const passwordsUtil = new PasswordsUtil();
module.exports = passwordsUtil;