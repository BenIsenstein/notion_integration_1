import { oauth2Client, transporter, db } from '../repositories'
import { GOOGLE_OAUTH_DEFAULT_SCOPES, USER_ID } from '../values'
import { GoogleTokensRow } from '../types'
import { Credentials } from 'google-auth-library'
import { makeInsertQuery, makeUpdateQuery, queryPayloadFromObject } from '../helpers'

const TOKENS_TABLE_NAME = 'google_tokens'
const TOKENS_ROW_KEYS = ['userId', 'tokens']

const _getGoogleTokens = db.query<GoogleTokensRow, string>('SELECT * FROM google_tokens WHERE userId = ?1;')
const _insertGoogleTokens = db.query(makeInsertQuery(TOKENS_TABLE_NAME, TOKENS_ROW_KEYS))
const _updateGoogleTokens = db.query(makeUpdateQuery(TOKENS_TABLE_NAME, TOKENS_ROW_KEYS, 'userId'))

export const createConsentPageUrl = (
    scopes: string[] = GOOGLE_OAUTH_DEFAULT_SCOPES
) => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true,
        prompt: 'consent'
    })
}

export const sendAuthTokenResetEmail = async () => {
    const consentPageUrl = createConsentPageUrl()

    await transporter.sendMail({
        from: USER_ID,
        to: USER_ID,
        subject: "Notion integration 1 - Please grant access to your Google account again",
        text: `Hello!\n\nWe've somehow lost the access to your Google account data necessary to work our magic.\n\nPlease let us get back to what we do best.\n\nReset your token here: ${consentPageUrl}`, // plain text body
        html: `Hello!<br><br>We've somehow lost the access to your Google account data necessary to work our magic.<br><br>Please let us get back to what we do best.<br><br>Reset your token <a href="${consentPageUrl}">here</a>.`, // html body
    })
}

export const getGoogleTokens = async (userId: string): Promise<Credentials | null> => {
    const tokens = _getGoogleTokens.get(userId)

    if (!tokens) {
        console.log('No Google tokens found, sending email to reset them...')
        await sendAuthTokenResetEmail()
        return null
    }

    return JSON.parse(tokens.tokens)
}

export const setGoogleTokens = (userId: string, tokens: Credentials) => {
    const row = {
        userId,
        tokens: JSON.stringify(tokens)
    }

    try {
        _insertGoogleTokens.run(queryPayloadFromObject(row))
    } catch {
        _updateGoogleTokens.run(queryPayloadFromObject(row))
    }
}