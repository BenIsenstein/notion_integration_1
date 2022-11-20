import { MongoClient } from "mongodb"
const mongoClient = new MongoClient(process.env.MONGO_CONNECTION_STRING)

export const withConnectAndClose = async (
    db,
    collection,
    callback
) => {
    await mongoClient.connect()
    await callback(mongoClient.db(db).collection(collection))
    await mongoClient.close()
}

export const openCollection = async (db, collection) => {
    await mongoClient.connect()

    return {
        collection: mongoClient.db(db).collection(collection),
        close: mongoClient.close.bind(mongoClient)
    }
}

export const openDatabase = async (db) => {
    await mongoClient.connect()

    return {
        database: mongoClient.db(db),
        close: mongoClient.close.bind(mongoClient)
    }
}