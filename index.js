// Distance of lat lon
function distance (lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist
}

const express = require('express')
const app = express()
const database = [
    { id: 1, lat: 3.10, lon: 100.00, status: 'Active' },
    { id: 2, lat: 3.00, lon: 101.00, status: 'OnJob' },
    { id: 3, lat: 2.90, lon: 102.00, status: 'Active' },
    { id: 4, lat: 1.80, lon: 99.00, status: 'Active' },
    { id: 5, lat: 4.10, lon: 98.00, status: 'Off' },
]
// Use body parser to get JSON data from req.body
app.use(express.json())
//error handler from middleware
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ errorType: err.name, message: err.message }); // Bad request
    }
    next()
});

// 1. AKTIFASI DRIVER
//activate driver that is currently off
app.put('/activate', (req, res, next) => {
    try {
        // Authorization role
        let role = req.headers.authorization
        if (!role || role != 'driver') {
            let err = new Error('Forbidden')
            err.status = 401
            throw err
        }
        //get driver_id from body
        let driverId = req.body.driver_id
        //if driver_id is empty
        if (!driverId) {
            let err = new Error('driver_id cannot be empty')
            err.status = 400
            throw err
        }
        //find driver with id from driver_id
        let driver = database.find(el => el.id == driverId)
        //if driver not found
        if (!driver) {
            let err = new Error('Driver not found!')
            err.status = 404
            throw err
        }
        let message
        //if driver status currently off
        if (driver.status == "Off") {
            message = `Status of Driver with id ${driverId} has been changed to Active`
            driver.status = 'Active'
        }
        //if driver status not off
        else {
            message = `Driver is already Active or is On Job`
        }
        //send json
        res.json({ message, driver: driver })
    }
    catch (err) {
        //catch eeror
        if (!err.status) {
            err.status = 500
        }
        req.err = err
        next()
    }
})
// 2.ASSIGN DRIVER
//get nearest driver and change status to OnJob
app.put('/assign', (req, res, next) => {
    try {
        // Authorization role
        let role = req.headers.authorization
        if (!role || role != 'user') {
            let err = new Error('Forbidden')
            err.status = 401
            throw err
        }
        //get lat lon from body
        let lat = req.body.lat
        let lon = req.body.lon
        //if lat or lon empty
        if (!lat || !lon) {
            let err = new Error('lat or lon cannot be empty')
            err.status = 400
            throw err
        }
        //check if there is driver available
        let available = database.some(el => el.status == "Active")
        //if there is no driver available
        if (!available) {
            let err = new Error('All Drivers are busy, try again later.')
            err.status = 503
            throw err
        }
        let nearestDistance = Number.MAX_VALUE
        let index = null
        //get nearest distance and index from database
        database.forEach((el, i) => {
            if (el.status == "Active") {
                let dif = distance(lat, lon, el.lat, el.lon, 'K')
                if (dif < nearestDistance) {
                    index = i
                    nearestDistance = dif
                }
            }
        })
        database[index].status = "OnJob"
        //send json
        res.json({ message: Math.round(nearestDistance) + ' KM', driver: database[index] })
    }
    catch (err) {
        //catch error
        if (!err.status) {
            err.status = 500
        }
        req.err = err
        next()
    }
})
// 3. DE-ASSIGN DRIVER
//change status driver from OnJob to Active
app.put('/deassign', (req, res, next) => {
    try {
        // Authorization role
        let role = req.headers.authorization
        if (!role || role != 'driver' || role != 'admin') {
            let err = new Error('Forbidden')
            err.status = 401
            throw err
        }
        //get driver_id from body
        let driverId = req.body.driver_id
        //if driver_id is empty
        if (!driverId) {
            let err = new Error('driver_id cannot be empty')
            err.status = 400
            throw err
        }
        //find driver with id from driver_id
        let driver = database.find(el => el.id == driverId)
        //if driver not found
        if (!driver) {
            let err = new Error('Driver not found!')
            err.status = 404
            throw err
        }
        let message
        //if driver status currently OnJob
        if (driver.status == "OnJob") {
            message = `Status of Driver with id ${driverId} has been changed to Active`
            driver.status = 'Active'
        }
        //if driver status not OnJob
        else {
            message = `Driver is already Active or Off`
        }
        //send json
        res.json({ message, driver: driver })
    }
    catch (err) {
        //catch eeror
        if (!err.status) {
            err.status = 500
        }
        req.err = err
        next()
    }
})
// 4. DE-AKTIFASI DRIVER
//change status driver from Active to Off
app.put('/deactivate', (req, res, next) => {
    try {
        // Authorization role
        let role = req.headers.authorization
        if (!role || role != 'driver') {
            let err = new Error('Forbidden')
            err.status = 401
            throw err
        }
        //get driver_id from body
        let driverId = req.body.driver_id
        //if driver_id is empty
        if (!driverId) {
            let err = new Error('driver_id cannot be empty')
            err.status = 400
            throw err
        }
        //find driver with id from driver_id
        let driver = database.find(el => el.id == driverId)
        //if driver not found
        if (!driver) {
            let err = new Error('Driver not found!')
            err.status = 404
            throw err
        }
        let message
        //if driver status currently Active
        if (driver.status == "Active") {
            message = `Status of Driver with id ${driverId} has been changed to Off`
            driver.status = 'Off'
        }
        //if driver status not Active
        else {
            message = `Driver is already Off or OnJob`
        }
        //send json
        res.json({ message, driver: driver })
    }
    catch (err) {
        //catch eeror
        if (!err.status) {
            err.status = 500
        }
        req.err = err
        next()
    }
})
// 5. DAFTAR DRIVER
//get list drivers
app.get('/', (req, res, next) => {
    // Authorization role
    try {
        let role = req.headers.authorization
        if (!role || role != 'admin') {
            let err = new Error('Forbidden')
            err.status = 401
            throw err
        }
        //get query id(optional)
        let driverId = req.query.driver_id
        let send = database
        //if there is query
        if (driverId) send = database.filter(el => el.id == driverId)
        res.json(send)
    }
    catch (err) {
        //catch eeror
        if (!err.status) {
            err.status = 500
        }
        req.err = err
        next()
    }

})

//if there is error, go here
app.use((req, res) => {

    let err = req.err
    if (err) {
        //send json error
        return res.status(err.status).json({ errorType: err.name, message: err.message })
    }
})


app.listen(process.env.PORT || 3000, () => {
    console.log('connected')
})
