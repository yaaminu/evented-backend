exports.MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/evented'
exports.MASTER_KEY = process.env.MASTER_KEY ||
    'p+PKpCjHQMXPW3X+Bja47GP34g38YH9uXc0t85kFwxBVzFlHZPgrh/XrYlleJdE1DIqvd0mQzL1vZuxTdfxjwor2Lgz1Rz5uan7f8y2alxk+NPWM2Q5gkqOoBkWu2O2bQEN8moTI2qL+WR3h1BbGo/8hKE9pDpfP34wppCrgBlM='
exports.APP_ID = process.env.APP_ID ||
    '8rRIZo9dfTmTQ76ZZ8WHmoNejWiAEMJ7y7Bq6531ZpOD5mR9NSXrAm9mBF2lb76O'
exports.PORT = process.env.PORT || 8080
exports.CLOUD_CODE_PATH = require('path').resolve(__dirname, 'cloud/main.js')
exports.SERVER_URL = process.env.SERVER_URL || 'http://localhost:8080/'

