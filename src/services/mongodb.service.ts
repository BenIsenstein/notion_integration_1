import { withConnectAndClose } from '../repositories'
import { makeDateAndTime } from '../helpers'

export const insertOne = async (collection, data = {}) => {
    await withConnectAndClose('prod', collection, async (col) => {
        await col.insertOne({ ...makeDateAndTime(), ...data })
    })
}

export const insertError = async (collection, error) => {
    const { message, stack } = error
    await insertOne(collection, { message, stack })
}