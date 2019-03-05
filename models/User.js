var mongoose = require('mongoose')
var UserSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true },
  password:     { type: String, required: true },
  permissions:  { type: [String], required: true, default: [
    'user:create', 'user:read', 'user:update', 'user:delete',
    'account:create', 'account:read', 'account:update', 'account:delete',
    'category:create', 'category:read', 'category:update', 'category:delete',
  ]}
})
module.exports = mongoose.model('User', UserSchema)