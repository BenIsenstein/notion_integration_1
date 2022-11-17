const { gmail } = require('../repositories')
const { NOTION_GMAIL_LABEL_ID } = require('../constants')
const { insertOne, insertError } = require('../services')

module.exports.inspectEmailPub = async (req, res, next) => {
    try {
        const data = req.body?.message?.data
        const dataJson = Buffer.from(data, 'base64').toString()
        const { emailAddress: userId, historyId: startHistoryId } = JSON.parse(dataJson)
        const history = await gmail.users.history.list({
            userId,
            startHistoryId,
            //labelId: NOTION_GMAIL_LABEL_ID,
            //maxResults: 1,
            historyTypes: [
                'messageAdded',
                'messageDeleted',
                'labelAdded',
                'labelRemoved'
            ]
        })

        if (history.data.history) {
            await insertOne('article-pubsub-logs-with-history', history.data)
        }
    } catch (error) {
        try {
            await insertError('article-pubsub-failures', error)
        } catch (err) {
            console.log('Failure while logging pubsub inspection error: ', err)
            console.log('Original error: ', error)
        }
    }

    next()
}