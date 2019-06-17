const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const CompanySchema = new mongoose.Schema({
  name: String,
  updated: { type: Date, default: Date.now },
  contract: { type: String, required: true },
  owner: { type: ObjectId, ref: 'User', required: true }
})

module.exports = mongoose.model('Company', CompanySchema)
