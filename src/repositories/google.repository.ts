import { google } from 'googleapis'
import { Storage as StorageClient } from '@google-cloud/storage'
import { CloudTasksClient } from '@google-cloud/tasks'

export { google }

export const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.WEB_API_URL}/auth-tokens/google`,
)

export const people = google.people('v1')

export const gmail = google.gmail('v1')

export const storage = new StorageClient({
    keyFilename: `${__dirname}/../credentials/articles-service-account-credentials.json`
})

export const tasks = new CloudTasksClient({
    keyFilename: `${__dirname}/../credentials/cloud-tasks-client-account-credentials.json`
})