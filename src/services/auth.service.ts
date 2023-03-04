import { oauth2Client, transporter } from '../repositories'
import { GOOGLE_OAUTH_DEFAULT_SCOPES, USER_ID } from '../values'

export const createConsentPageUrl = (
    scopes: string[] = GOOGLE_OAUTH_DEFAULT_SCOPES
) => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true,
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
