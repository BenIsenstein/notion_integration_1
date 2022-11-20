import { writeFileSync } from 'fs'
import { google } from 'googleapis'

export const initGoogleApi = () => {
    writeFileSync(__dirname + '/../credentials/articles-service-account-credentials.json', process.env.ARTICLES_SERVICE_ACCOUNT_CREDENTIALS)
    writeFileSync(__dirname + '/../credentials/cloud-tasks-client-account-credentials.json', process.env.CLOUD_TASKS_CLIENT_ACCOUNT_CREDENTIALS)

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CALLBACK_URL
    )

    oauth2Client.setCredentials(JSON.parse(process.env.GCP_TOKENS))
    google.options({
        auth: oauth2Client
    })
}
