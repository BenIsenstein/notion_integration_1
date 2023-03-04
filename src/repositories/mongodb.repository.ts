import { Collection, MongoClient } from "mongodb"
const mongoClient = new MongoClient(process.env.MONGO_URL)

export const withConnectAndClose = async <
    TDocument,
    TReturn
>(
    db: string,
    collection: string,
    callback: (col: Collection<TDocument>) => Promise<TReturn>
) => {
    try {
        let returnVal: TReturn

        await mongoClient.connect()
        returnVal = await callback(mongoClient.db(db).collection(collection))
        await mongoClient.close()

        return returnVal
    } catch (error) {
        await mongoClient.close()
        throw new Error(error)
    }
}

export const openCollection = async <TDocument>(db: string, collection: string) => {
    await mongoClient.connect()

    return {
        collection: mongoClient.db(db).collection<TDocument>(collection),
        close: mongoClient.close.bind(mongoClient) as () => Promise<void>
    }
}

export const openDatabase = async (db: string) => {
    await mongoClient.connect()

    return {
        database: mongoClient.db(db),
        close: mongoClient.close.bind(mongoClient) as () => Promise<void>
    }
}