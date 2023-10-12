import { gmail } from '../../repositories'
import { NOTION_GMAIL_LABEL_ID, ONE_HOUR_OF_MILLISECONDS, USER_ID, PUBSUB_TOPIC } from '../../values'
import axios from 'axios'
import { HttpJob } from '../../types'

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

const createHttpJob = async (executionTime: number) => {
  const newJob: HttpJob = {
    method: 'POST',
    url: `${process.env.WEB_API_URL}/gmail-inbox-subscriptions`,
    executionTime,
  }

  return await axios.post(`${process.env.HTTP_QUEUE_URL}/jobs`, newJob)
}

export const renewGmailPushNotificationsWatch = async (req, res) => {
  try {
    await stop()

    //const labelIds = await getLabelIdsByName()
    const watchRes = await watch()

    await createHttpJob(+watchRes.data.expiration - ONE_HOUR_OF_MILLISECONDS)
    //await insertOne('gmail-watch-renewals')
    res.sendStatus(204)
  }
  catch (err) {
    console.log(err)
    //await insertError('gmail-watch-renewal-failures', err)
    res.sendStatus(500)
  }
}
