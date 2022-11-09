const router = require('express').Router()
const {
    processEmailArticle,
    renewGmailPushNotificationsWatch
} = require('../controllers')

router.post('/articles', processEmailArticle)
router.post('/gmail-inbox-subscriptions', renewGmailPushNotificationsWatch)

router.get('/health-check', (req, res) => {
    res.status(200).send("Server is running")
})

module.exports = router