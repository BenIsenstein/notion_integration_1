require("dotenv").config()
require("../helpers").initGoogleApi()
const { renewGmailPushNotificationsWatch } = require('../controllers')

const res = { 
    sendStatus(code) {
        console.log(`Sent status code of ${code}`)
    }
}

renewGmailPushNotificationsWatch(null, res)