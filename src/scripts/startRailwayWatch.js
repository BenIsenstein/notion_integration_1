const { resolve }  = require('path')
require("dotenv").config({
    path: resolve(process.cwd(), '.env.prod')
})
const { initGoogleApi } = require('../helpers/initGoogleApi')
const { renewGmailPushNotificationsWatch } = require('../controllers')

const res = { 
    sendStatus(code) {
        console.log(`Sent status code of ${code}`)
    }
}

;(async () => {
    await initGoogleApi()
    await renewGmailPushNotificationsWatch({}, res)
})()