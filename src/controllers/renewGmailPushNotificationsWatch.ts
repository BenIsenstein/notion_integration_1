import { gmail } from '../repositories'
import { NOTION_GMAIL_LABEL_ID, ONE_HOUR_OF_MILLISECONDS, USER_ID, PUBSUB_TOPIC } from '../values'

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

export const renewGmailPushNotificationsWatch = async (req, res) => {
  try {
    console.log('STOPPING GMAIL WATCH')
    await stop()

    //const labelIds = await getLabelIdsByName()
    console.log("RESTARTING GMAIL WATCH")
    const watchRes = await watch()

    //await insertOne('gmail-watch-renewals')
    console.log('SENDING RESPONSE')
    res.header('x-next-execution-ms',  +watchRes.data.expiration - ONE_HOUR_OF_MILLISECONDS)
    res.sendStatus(204)
    console.log('SUCCESSFULLY RENEWED GMAIL WATCH')
  }
  catch (err) {
    console.log('RENEW GMAIL WATCH ERROR: ', err.message)
    //await insertError('gmail-watch-renewal-failures', err)
    res.sendStatus(500)
  }
}
