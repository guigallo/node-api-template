const express = require('express')
const consign = require('consign')
const bodyParser = require('body-parser')
const validator = require('express-validator')
const morgan = require('morgan')
const logger = require('../services/logger')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../documentation/swagger.json')
const app = express()
const cors = require('cors')

const enableCors = () => app.use(cors())

const startLogger = () => {
  app.use(morgan('common', {
    stream: { write: message => logger.info(message) }
  }))
  console.log('+ Morgan and logger started')
}

const setMiddleares = () => {
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
  app.use(validator())
  app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  console.log('+ Middlewares loaded')
}

const autoLoad = () => consign()
  .include('routes')
  .then('db')
  .into(app)

const loadErrorsPages = () => {
  app.use((req, res, next) => res.status(404).json({ message: 'Not found.' }) )
  app.use((error, req, res, next) => {
    if (error) logger.info('Internal error: ' + error)
    res.status(500).json({ message: 'Internal error.' })
  })

  console.log('+ Errors page loaded')
}

module.exports = () => {
  enableCors()
  startLogger()
  setMiddleares()
  autoLoad()
  loadErrorsPages()

  return app
}