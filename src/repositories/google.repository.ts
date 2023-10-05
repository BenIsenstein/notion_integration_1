import { google } from 'googleapis'

export { google }

export const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.WEB_API_URL}/auth-tokens/google`,
)

export const people = google.people('v1')

export const gmail = google.gmail('v1')

export const youtube = google.youtube('v3')
