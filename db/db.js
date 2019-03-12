const config = require('../config/config')
const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

const connString = process.env.MONGODB_URI || `mongodb://${config.dbAddress}:${config.dbPort}/${config.dbDataBase}`
const connection = mongoose.connect(connString, { useNewUrlParser: true })

module.exports = connection