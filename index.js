var cluster = require('cluster')
var os = require('os')

const CPUS = os.cpus()

if (cluster.isMaster) {
  CPUS.forEach(function () {
    cluster.fork()
  })

  cluster.on('listening', worker => {
    console.log('Worker %d connected', worker.process.pid)
  })

  cluster.on('disconnect', worker => {
    console.log('Worker %d disconnected', worker.process.pid)
  })

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`)
    console.log('Starting a new worker')
    cluster.fork()
  })
} else {
  require('./api.js')
}
