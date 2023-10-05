import { oauth2Client, google } from '../repositories'
import { getGoogleTokens } from '../services'
import { USER_ID } from '../values'

export const initGoogleApi = async () => {
    oauth2Client.setCredentials(await getGoogleTokens(USER_ID))
    google.options({
        auth: oauth2Client
    })
}
