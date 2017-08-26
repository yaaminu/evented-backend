Parse.Cloud.define('contactDriver', (req, res) => {
    console.log(req.params)
    console.log(req.user)

    if (!req.user) {
        return res.error('UnAuthorized')
    }

    let query = new Parse.Query(Parse.Installation)

    query.equalTo('truckId', req.params.truckId)

    Parse.Push.send({
        where: query,
        priority: 'high',
        data: {
            message: {
                action: 'tripRequest',
                client: {
                    userId: req.user.id,
                    name: req.user.get('name')
                },
                location: {
                    lat: req.params.lat,
                    long: req.params.long
                },
                tripName: req.params.tripName
            }
        }
    }, {
        useMasterKey: true,
        success: function() {
            // Push sent!
            res.success('sent')
        },
        error: function(error) {
            // There was a problem :(
            res.error(error)
        }
    });
    console.log('sent push')
})

Parse.Cloud.define('startTrip', (req, res) => {
    console.log(req.params)
    console.log(req.user)

    if (!req.user) {
        return res.error('UnAuthorized')
    }

    makeParseQuery('truck').get(req.user.get('truckId'))
        .then(truck => {

            let trip = new(Parse.Object.extend('trip'))()
            trip.set('truckId', req.params.truckId)
            trip.set('hiredBy', req.params.hiredBy)
            trip.set('tripName', req.params.tripName)
            trip.set('startLocation', new Parse.GeoPoint(req.params.lat, req.params.long))
            trip.set('driverId', req.user.id)
            truck.set('available', false)
            return Promise.all([trip.save(), truck.save()])
        }).then(objects => {
            let trip = objects[0] //se the promise above

            let query = new Parse.Query(Parse.Installation)
            query.equalTo('userId', trip.get('hiredBy'))

            res.success(trip) //tell the  caller

            //TODO schedule this as a job
            return sendPush('acceptTrip', query, trip, req)
        })
        .then(() => {
            console.log('trip sent successfully')
        }).catch(err => {
            res.error(err)
        })
})

Parse.Cloud.define('endTrip', (req, res) => {
    if (!req.user) {
        return res.error('UnAuthorized')
    }

    let trip, truck
    makeParseQuery('trip').get(req.params.tripId)
        .then(obj => {
            trip = obj
            let geoPoint = { lat: req.params.lat, long: req.params.long }
            console.log(geoPoint)
            trip.set('endLocation', JSON.stringify(geoPoint))
            trip.set('endTime', Date.now())
            return makeParseQuery('truck').get(trip.get('truckId'))
        }).then(obj => {
            truck = obj
            if (req.user.id != truck.get('ownerId')) {
                console.log(`${req.user.id} !== ${truck.ownerId}`)
                throw new Error('UnAuthorized')
            }
            truck.set('available', true)
            return Promise.all([trip.save(), truck.save()])
        }).then(objs => {
            res.success(objs[0])

            let query = new Parse.Query(Parse.Installation)
            query.equalTo('userId', objs[0].get('hiredBy'))

            sendPush('endTrip', query, objs[0], req)
                .then(() => {
                    console.log('push sent successfull')
                }, err => {
                    console.log(`encountered ${err} while sending push`)
                })
        })
        .catch(err => {
            res.error(err)
        })

})

Parse.Cloud.afterSave('message', req => {

    let object = req.object
    let query = new Parse.Query(Parse.Installation)
    query.equalTo('userId', object.get('recipientId'))

    return Parse.Push.send({
        where: query,
        priority: 'high',
        data: {
            message: {
                action: 'message',
                senderId: object.get('senderId'),
                senderName: object.get('senderName'),
                messageId: object.get('messageId'),
                text: object.get('text'),
                remoteUrl: object.get('remoteUrl'),
                type: object.get('type'),
                dateComposed: object.createdAt.getTime()
            }
        }
    }, { useMasterKey: true })
})

function sendPush(action, query, obj, req) {
    let payload = {
        action: action,
        trip: {
            lat: req.params.lat,
            long: req.params.long,
            startTime: obj.createdAt.getTime(),
            truckId: obj.get('truckId'),
            tripName: obj.get('tripName'),
            tripId: obj.id,
            driverId: obj.get('driverId')
        }
    }

    return Parse.Push.send({
        where: query,
        priority: 'high',
        data: {
            message: payload
        }
    }, { useMasterKey: true })
}

function makeParseQuery(className) {
    var obj = Parse.Object.extend(className)
    return new Parse.Query(obj)
}