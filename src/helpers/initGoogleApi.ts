import { writeFileSync } from 'fs'
import { oauth2Client, google } from '../repositories'
import { getGoogleTokens } from '../services'
import { USER_ID } from '../values'

export const initGoogleApi = async () => {
    oauth2Client.setCredentials(await getGoogleTokens(USER_ID))
    google.options({
        auth: oauth2Client
    })
    writeFileSync(
        `${__dirname}/../credentials/articles-service-account-credentials.json`,
        process.env.ARTICLES_SERVICE_ACCOUNT_CREDENTIALS
    )
    writeFileSync(
        `${__dirname}/../credentials/cloud-tasks-client-account-credentials.json`,
        process.env.CLOUD_TASKS_CLIENT_ACCOUNT_CREDENTIALS
    )
}
