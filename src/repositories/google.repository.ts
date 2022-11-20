import { google } from 'googleapis'
import { Storage as StorageClient} from '@google-cloud/storage'
import { CloudTasksClient } from '@google-cloud/tasks'

export const gmail = google.gmail('v1')

export const storage = new StorageClient({
    keyFilename: `${__dirname}/../credentials/articles-service-account-credentials.json`
})

export const tasksClient = new CloudTasksClient({
    keyFilename: `${__dirname}/../credentials/cloud-tasks-client-account-credentials.json`
})