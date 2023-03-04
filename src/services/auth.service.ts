import nodemailer from 'nodemailer'
import { oauth2Client } from '../repositories'
import { USER_ID } from '../values'

export const createConsentPageUrl = () => {
    const scopes = [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/contacts",
        "https://mail.google.com/",
        "openid",
    ]

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    })
}

export const sendAuthTokenResetEmail = async () => {
    const consentPageUrl = createConsentPageUrl()
    const transporter = nodemailer.createTransport({
        requireTLS: true,
        host: process.env.AWS_SMTP_HOST,
        port: 587,
        auth: {
            user: process.env.AWS_SMTP_USER,
            pass: process.env.AWS_SMTP_PASS,
        },
    })
    await transporter.sendMail({
        from: USER_ID,
        to: USER_ID,
        subject: "Notion integration 1 - Please grant access to your Google account again",
        text: `Hello!\n\nWe've somehow lost the access to your Google account data necessary to work our magic.\n\nPlease let us get back to what we do best.\n\nReset your token here: ${consentPageUrl}`, // plain text body
        html: `Hello!<br><br>We've somehow lost the access to your Google account data necessary to work our magic.<br><br>Please let us get back to what we do best.<br><br>Reset your token <a href="${consentPageUrl}">here</a>.`, // html body
    })
}
