import { oauth2Client, google } from '../repositories'
import { getGoogleTokens } from '../services'
import { USER_ID } from '../values'

export const initGoogleApi = async () => {
    const tokens = await getGoogleTokens(USER_ID)

    if (tokens) oauth2Client.setCredentials(tokens)
    
    google.options({ auth: oauth2Client })
}
