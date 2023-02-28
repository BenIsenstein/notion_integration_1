import { writeFileSync } from 'fs'
import { oauth2Client, google } from '../repositories'

export const initGoogleApi = () => {
    writeFileSync(__dirname + '/../credentials/articles-service-account-credentials.json', process.env.ARTICLES_SERVICE_ACCOUNT_CREDENTIALS)
    writeFileSync(__dirname + '/../credentials/cloud-tasks-client-account-credentials.json', process.env.CLOUD_TASKS_CLIENT_ACCOUNT_CREDENTIALS)

    oauth2Client.setCredentials(JSON.parse(process.env.GCP_TOKENS))
    google.options({
        auth: oauth2Client
    })
}
