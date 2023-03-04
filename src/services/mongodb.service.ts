import { withConnectAndClose } from '../repositories'
import { makeDateAndTime } from '../helpers'
import { Credentials, IGoogleTokensDocument } from '../types'
import { sendAuthTokenResetEmail } from './auth.service'

export const insertOne = async (collection, data = {}) => {
    await withConnectAndClose('prod', collection, async (col) => {
        await col.insertOne({ ...makeDateAndTime(), ...data })
    })
}

export const insertError = async (collection, error) => {
    const { message, stack } = error
    await insertOne(collection, { message, stack })
}

export const getGoogleTokens = async (
    userId: string
): Promise<Credentials> => {
    const tokens = await withConnectAndClose<IGoogleTokensDocument, Credentials>(
        'prod',
        'google-tokens',
        async (col) => (await col.findOne({ userId }))?.tokens
    )

    if (!tokens) {
        console.log('No Google tokens found, sending email to reset them...')
        await sendAuthTokenResetEmail()
    }

    return tokens
}

export const setGoogleTokens = async (
    document: IGoogleTokensDocument
): Promise<void> => {
    const { userId } = document

    await withConnectAndClose<IGoogleTokensDocument, void>(
        'prod',
        'google-tokens',
        async (col) => {
            const existingTokens = (await col.findOne({ userId }))?.tokens

            if (existingTokens) {
                await col.updateOne({ userId }, { $set: document })
                return
            }

            await col.insertOne(document)
        }
    )
}