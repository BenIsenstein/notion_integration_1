const { google } = require('googleapis')
const gmail = google.gmail('v1')
const { articlePubsubLogs, close } = require('../repositories')

module.exports.inspectEmailPub = async (req, res, next) => {
    try {
        const data = req.body?.message?.data
        const id = req.body?.message?.messageId

        if (!data) {
            res.status(500).send('No message data')
            return
        }

        const dataJson = Buffer.from(data, 'base64').toString()
        const { emailAddress: userId } = JSON.parse(dataJson)
        const messageRes = await gmail.users.messages.get({ userId, id })
        const { headers } = messageRes.data.payload
        const subject = headers.find(h => h.name === 'Subject')?.value?.slice(0,96)
        const from = headers.find(h => h.name === 'From')?.value
        const datetime = Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'long' }).format()

        await articlePubsubLogs.insertOne({ id, datetime, from, subject })
        close()
    } catch (err) {
        console.log(err)
    }
    
    next()
}