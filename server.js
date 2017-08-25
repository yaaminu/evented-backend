global.config = require('./config')

const express = require('express')

const ParseServer = require('parse-server').ParseServer
var api = new ParseServer({
    databaseURI: config.MONGO_URL,
    appId: config.APP_ID,
    masterKey: config.MASTER_KEY,
    serverURL: config.SERVER_URL,
    allowClientClassCreation: true,
    cloud: './cloud.js',
    liveQuery: {
        classNames: ['truck']
    },
    push: {
        android: {
            senderId: '237339047105',
            apiKey: 'AAAAN0KCdME:APA91bEibpRVsllJNkW_7BbQA1zeebJFjuEmT2ANPdhgRnZR-I2pUQNwlSFBR6eBMipI76SdHiAN0u9rGBA8Hz84Mc6o1nDtourG4PIzh2ULpF4Pg63eTG4s_qsE5CGuyTKqDPd1lGFK'
        }
    }
})

var app = express()

app.get('/', (req, res) => {
    res.end(`welcome to moverifft ${new Date}`)
})

app.use('/api', api)
app.use('/', api)

app.use(/.*/, (req, res, next) => {
    next({
        status: 404,
        message: `${req.path} Not found`
    })
})

app.use((err, req, res, next) => {
    res.end(`error: ${JSON.stringify(err)}`)
})

const server = require('http').createServer(app)

server.listen(config.PORT, () => {
    console.log(`listening on prot : ${config.PORT}`)
})

ParseServer.createLiveQueryServer(server)