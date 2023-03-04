import { gmail, tasksClient } from '../../repositories'
import { NOTION_GMAIL_LABEL_ID, ONE_HOUR_OF_MILLISECONDS, USER_ID, PUBSUB_TOPIC } from '../../values'
import { insertOne, insertError } from '../../services'

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

const createTask = async (seconds) => {
  const url = `${process.env.WEB_API_URL}/gmail-inbox-subscriptions`
  const location = 'us-central1'
  const queue = 'refresh-gmail-push-notification-watch-queue'
  const parent = tasksClient.queuePath(process.env.GCP_PROJECT, location, queue)

  const task = {
    httpRequest: {
      headers: {
        'Content-Type': 'text/plain',
      },
      httpMethod: 'POST' as 'POST',
      url
    },
    scheduleTime: {
      seconds
    }
  }

  const request = { parent, task }
  return await tasksClient.createTask(request)
}

export const renewGmailPushNotificationsWatch = async (req, res) => {
  try {
    await stop()

    //const labelIds = await getLabelIdsByName()
    const watchRes = await watch()
    const dateForReset = (+watchRes.data.expiration - ONE_HOUR_OF_MILLISECONDS) / 1000

    await createTask(dateForReset)
    await insertOne('gmail-watch-renewals')
    res.sendStatus(204)
  }
  catch (err) {
    console.log(err)
    await insertError('gmail-watch-renewal-failures', err)
    res.sendStatus(500)
  }
}
