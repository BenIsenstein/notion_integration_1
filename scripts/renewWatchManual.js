require("dotenv").config()
require("../helpers").initGoogleApi()
const { gmail } = require('../repositories')
const { NOTION_GMAIL_LABEL_ID, USER_ID, PUBSUB_TOPIC } = require('../constants')

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

;(async () => {
    try {
        await stop()
        await watch()
      }
      catch (err) {
        console.log(err)
      }
})()
