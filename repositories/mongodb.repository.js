const { MongoClient } = require("mongodb")
const mongoClient = new MongoClient(process.env.MONGO_CONNECTION_STRING)

module.exports = {
    close:() => mongoClient.close(),
    articlePubsubLogs: mongoClient.db('prod').collection('article-pubsub-logs')
}