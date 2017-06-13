global.config = require('./config')

const express = require('express')

const ParseServer = require('parse-server').ParseServer
var api = new ParseServer({
    databaseURI: config.MONGO_URL,
    appId: config.APP_ID,
    masterKey: config.MASTER_KEY,
    serverURL: config.SERVER_URL,
    allowClientClassCreation: true
})

var app = express()

app.get('/',(req,res)=>{
  res.end(`welcome to moverifft ${new Date}`)
})

app.use('/api', api)

app.use(/.*/, (req, res, next) => {
    next({
        status: 404,
        message: `${req.path} Not found`
    })
})

app.use((err, req, res, next) => {
    res.end(`error: ${JSON.stringify(err)}`)
})

app.listen(config.PORT, () => {
    console.log(`listening on port: ${config.PORT}`)
})
