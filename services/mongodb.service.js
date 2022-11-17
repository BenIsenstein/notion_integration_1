const { withConnectAndClose } = require('../repositories')
const { makeDateAndTime } = require('../helpers')

const insertOne = async (collection, data = {}) => {
    await withConnectAndClose('prod', collection, async (col) => {
        await col.insertOne({ ...makeDateAndTime(), ...data })
    })
}

const insertError = async (collection, error) => {
    const { message, stack } = error
    await insertOne(collection, { message, stack })
}

module.exports = {
    insertOne,
    insertError
}