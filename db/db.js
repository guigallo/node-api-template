const config = require('../config/config');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const connString = `mongodb://${config.dbAddress}:${config.dbPort}/${config.dbDataBase}`;
const connection = mongoose.connect(connString, { useNewUrlParser: true });

module.exports = connection;