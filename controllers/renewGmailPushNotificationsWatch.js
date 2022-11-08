const { CloudTasksClient } = require('@google-cloud/tasks');
const { google } = require('googleapis')
const { NOTION_GMAIL_LABEL_ID, ONE_HOUR_OF_MILLISECONDS, USER_ID, PUBSUB_TOPIC } = require('../constants')

const gmail = google.gmail('v1')

/* Function to be used later with multiple clients using the application */

// const getLabelIdsByName = async (
//   userId = USER_ID,
//   labelNames = ['process_into_notion']
// ) => {
//   const labelsRes = await gmail.users.labels.list({ userId })

//   return labelsRes
//     ?.data?.labels
//     ?.filter(l => labelNames.includes(l.name))
//     ?.map(l => l.id)
//     ?.filter(id => !!id)
// }

const stop = async (userId = USER_ID) => {
  await gmail.users.stop({
    userId
  })
}

const watch = async (
  userId = USER_ID,
  labelIds = [NOTION_GMAIL_LABEL_ID],
  pubsubTopic = PUBSUB_TOPIC
) => {
  const watchRes = await gmail.users.watch({
    userId,
    requestBody: {
      labelIds: labelIds || ['INBOX'],
      topicName: `projects/${process.env.GCP_PROJECT}/topics/${pubsubTopic}`
    }
  })

  return watchRes
}

const createTask = async (seconds, payload) => {
  const tasksClient = new CloudTasksClient({
    keyFilename: `${__dirname}/../credentials/cloud-tasks-client-account-credentials.json`
  })
  const url = process.env.REFRESH_GMAIL_PUSH_NOTIFICATION_WATCH_URL
  const serviceAccountEmail = require('../credentials/cloud-tasks-client-account-credentials.json').client_email
  const location = 'us-central1'
  const queue = 'refresh-gmail-push-notification-watch-queue'
  const parent = tasksClient.queuePath(process.env.GCP_PROJECT, location, queue)

  const task = {
    httpRequest: {
      headers: {
        'Content-Type': 'text/plain',
      },
      httpMethod: 'POST',
      url
    },
    scheduleTime: {
      seconds
    }
  }

  if (payload) {
    task.httpRequest.body = Buffer.from(payload).toString('base64')
  }

  const request = { parent, task }
  await tasksClient.createTask(request)
}

module.exports.renewGmailPushNotificationsWatch = async (req, res) => {
  try {
    await stop()

    //const labelIds = await getLabelIdsByName()
    const watchRes = await watch()
    const dateForReset = (+watchRes.data.expiration - ONE_HOUR_OF_MILLISECONDS) / 1000

    await createTask(dateForReset)

    res.sendStatus(204)
  }
  catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
}