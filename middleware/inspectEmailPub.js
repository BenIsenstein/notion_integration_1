const { gmail, openDatabase, withConnectAndClose } = require('../repositories')
const { NOTION_GMAIL_LABEL_ID } = require('../constants')
const { makeDateAndTime } = require('../helpers')

module.exports.inspectEmailPub = async (req, res, next) => {
    const { date, time } = makeDateAndTime()

    try {
        const { database, close } = await openDatabase('prod')
        const logsWithHistory = database.collection('article-pubsub-logs-with-history')
        const logs = database.collection('article-pubsub-logs')
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
            await logsWithHistory.insertOne({ date, time, ...history.data })
        }
        await logs.insertOne({ date, time, ...history.data })
        await close()
    } catch (error) {
        try {
            await withConnectAndClose('prod', 'article-pubsub-failures', async (col) => {
                await col.insertOne({ date, time, error: error.toString() })
            })
        } catch (err) {
            console.log('Failure while logging pubsub inspection error: ', err)
            console.log('Original error: ', error)
        }
    }

    next()
}