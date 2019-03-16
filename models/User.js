const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

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
  contract: { type: String, required: true },
  companies: { type: [{ type: ObjectId, ref: 'Company' }], required: true }
})
UserSchema.index({ email: 1 }, { unique: true, sparse: true })
module.exports = mongoose.model('User', UserSchema)
