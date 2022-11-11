const { google } = require('googleapis')
const {Storage} = require('@google-cloud/storage')
const { CloudTasksClient } = require('@google-cloud/tasks')

const gmail = google.gmail('v1')
const storage = new Storage({
    keyFilename: `${__dirname}/../credentials/articles-service-account-credentials.json`
})
const tasksClient = new CloudTasksClient({
    keyFilename: `${__dirname}/../credentials/cloud-tasks-client-account-credentials.json`
})

module.exports = {
    gmail,
    storage,
    tasksClient
}