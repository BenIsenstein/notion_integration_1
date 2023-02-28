import { oauth2Client } from '../repositories'

export const redirectUserToGoogleOauth = (req, res) => {
    const scopes = [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/contacts",
        "https://mail.google.com/",
        "openid",
    ]

    const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    })

    res.redirect(authorizationUrl)
}