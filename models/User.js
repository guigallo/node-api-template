const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  permissions: {
    type: [String],
    required: true,
    default: [
      'user:create', 'user:read', 'user:update', 'user:delete',
      'company:create', 'company:read', 'company:update', 'company:delete'
    ]
  },
  contract: { type: String, required: true }
})
UserSchema.index({ email: 1 }, { unique: true, sparse: true })

module.exports = mongoose.model('User', UserSchema)
