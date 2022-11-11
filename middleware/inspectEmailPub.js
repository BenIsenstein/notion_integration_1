const { gmail, withConnectAndClose  } = require('../repositories')
const { NOTION_GMAIL_LABEL_ID } = require('../constants')

module.exports.inspectEmailPub = async (req, res, next) => {
    try {
        const data = req.body?.message?.data

        if (!data) {
            res.status(500).send('No message data')
            return
        }

        const dataJson = Buffer.from(data, 'base64').toString()
        // const { emailAddress: userId } = JSON.parse(dataJson)
        
        // const id = ''
        // const messageRes = await gmail.users.messages.get({ userId, id })
        // const { headers } = messageRes.data.payload
        // const subject = headers.find(h => h.name === 'Subject')?.value?.slice(0,96)
        // const from = headers.find(h => h.name === 'From')?.value
        const datetime = Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'long' }).format()

        //await articlePubsubLogs.insertOne({ id, datetime, from, subject })
        await withConnectAndClose('prod', 'article-pubsub-logs', async (coll) => {
            await coll.insertOne({ ...JSON.parse(dataJson), datetime })
        })
    } catch (err) {
        console.log(err)
    }

    next()
}