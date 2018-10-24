const express = require('express');
const consign = require('consign');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const morgan = require('morgan');
const logger = require('../services/logger');

module.exports = function() {
  var app = express();

  app.use(morgan('common', {
    stream: {
      write: function(message) {
        logger.info(message)
      }
    }
  }));

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(validator());

  consign()
    .include('routes')
    .then('db')
    .into(app);

  return app;
}