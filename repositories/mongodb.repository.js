const { MongoClient } = require("mongodb")
const mongoClient = new MongoClient(process.env.MONGO_CONNECTION_STRING)

const withConnectAndClose = async (
    db,
    collection,
    callback
) => {
    await mongoClient.connect()
    await callback(mongoClient.db(db).collection(collection))
    await mongoClient.close()
}

const openCollection = async (db, collection) => {
    await mongoClient.connect()

    return {
        collection: mongoClient.db(db).collection(collection),
        close: mongoClient.close.bind(mongoClient)
    }
}

const openDatabase = async (db) => {
    await mongoClient.connect()

    return {
        database: mongoClient.db(db),
        close: mongoClient.close.bind(mongoClient)
    }
}

module.exports = {
    withConnectAndClose,
    openCollection,
    openDatabase
}