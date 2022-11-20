import { Router } from 'express'
import { processEmailArticle, renewGmailPushNotificationsWatch } from '../controllers'
import { inspectEmailPub } from '../middleware'

const router = Router()

router.post('/articles', inspectEmailPub, processEmailArticle)
router.post('/gmail-inbox-subscriptions', renewGmailPushNotificationsWatch)

router.get('/health-check', (req, res) => {
    res.status(200).send("Server is running")
})

export default router