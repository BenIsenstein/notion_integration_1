import { Router } from 'express'
import { inspectEmailPub } from '../middleware'
import {
    processEmailArticle,
    renewGmailPushNotificationsWatch,
    redirectUserToGoogleOauth,
    authedUserTokensFromGoogleOauthResponseCode
} from '../controllers'

const router = Router()

router.post('/articles', inspectEmailPub, processEmailArticle)
router.post('/gmail-inbox-subscriptions', renewGmailPushNotificationsWatch)
router.get('/auth-flows/google', redirectUserToGoogleOauth)
router.get('/auth-tokens/google', authedUserTokensFromGoogleOauthResponseCode)

export default router