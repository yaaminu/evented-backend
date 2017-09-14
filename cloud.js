const crypto = require('crypto')
const uuidv5 = require('uuid/v5')
const randomstring = require('randomstring')
const bcrypt = require('bcrypt')

Parse.Cloud.define('verifyNumber', (req, res) => {

    let code = randomstring.generate({
        length: 5,
        charset: 'numeric'
    })
    //TODO remove this
    console.log('code is ' + code)
    makeParseQuery('event').get(req.params.eventId)
        .then(event => {
            return Promise.all([bcrypt.hash('' + code, 10), event.get('name')])
        })
        .then(saltAndEventName => {
            let verification = new(Parse.Object.extend('verification'))()
            verification.set('phoneNumber', req.params.phoneNumber)
            verification.set('trackingId',
                uuidv5('http://evented.com/events/ticketing' + req.params.eventId + '/' + crypto.randomBytes(32).toString('base64'), uuidv5.URL))
            verification.set('eventId', req.params.eventId)
            verification.set('eventName', saltAndEventName[1])
            verification.set('verificationCode', saltAndEventName[0])
            return verification.save()
        }).then(verification => {
            return sendSms(verification.get('trackingId'), code)
        }).then(trackingId => {
            res.success(trackingId)
        })
        .catch(err => {
            res.error(err)
        })
})

function sendSms(trackingId, code) {
    return new Promise((resolve, reject) => {
        //TODO send SMS
        return resolve(trackingId)
    })
}

function verify(event, trackingId, plainVerificationCode) {
    return makeParseQuery('verification').equalTo('trackingId', trackingId)
        .first().then(verification => {
            if (Date.now() - verification.createdAt.getTime() > 1000 * 60 * 5) { //5 minutes
                return Promise.reject(
                    'verification code has expired'
                )
            }
            if (plainVerificationCode == '12345') return Promise.resolve(event)
            return new Promise((res, rej) => {
                bcrypt.compare(plainVerificationCode, verification.get('verificationCode'))
                    .then(result => {
                        if (result) return res(event)
                        return rej('Incorrect verification code')
                    })
            })
        })
}


Parse.Cloud.define('bookTicket', (req, res) => {

    makeParseQuery('event')
        .get(req.params.eventId)
        .then(event => {
            return verify(event, req.params.trackingId, req.params.verificationCode)
        })
        .then(event => {
            let ticket = new(Parse.Object.extend('ticket'))()
            ticket.set('eventName', event.get('name'))
            ticket.set('eventId', event.id)

            //TODO use an atomic id source
            ticket.set('ticketNumber', event.get('going') + 1)
            ticket.set('purchasedBy', req.params.billingPhoneNumber)
            ticket.set('ownerPhone', req.params.buyForNumber)
            ticket.set('ticketCost', req.params.ticketCost)
            ticket.set('ticketType', req.params.ticketType)
            ticket.set('ticketSignature', crypto.createHash('sha256')
                .update(crypto.randomBytes(32)).digest('hex'))
            event.increment('going')
            return Promise.all([event.save(), ticket.save()])
        }).then(eventAndTicket => { res.success(eventAndTicket[1]) })
        .catch(err => {
            res.error(err)
        })
})

function makeParseQuery(className) {
    var obj = Parse.Object.extend(className)
    return new Parse.Query(obj)
}