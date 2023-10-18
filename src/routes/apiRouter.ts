import { Router } from 'express'
import {
    processEmailArticle,
    renewGmailPushNotificationsWatch,
    redirectUserToGoogleOauth,
    authedUserTokensFromGoogleOauthResponseCode,
    eraseEmptyJournals,
    syncContactsBetweenNotionAndGoogle
} from '../controllers'

const router = Router()

router.post('/articles', processEmailArticle)
router.post('/gmail-inbox-subscriptions', renewGmailPushNotificationsWatch)
router.get('/auth-flows/google', redirectUserToGoogleOauth)
router.get('/auth-tokens/google', authedUserTokensFromGoogleOauthResponseCode)
router.delete('/journals', eraseEmptyJournals)
router.post('/contacts-sync-runs', syncContactsBetweenNotionAndGoogle)

export default router