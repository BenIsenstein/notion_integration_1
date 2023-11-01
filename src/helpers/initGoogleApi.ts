import { oauth2Client, google } from '../repositories'
import { getGoogleTokens } from '../services'
import { USER_ID } from '../values'

export const initGoogleApi = async () => {
    const tokens = await getGoogleTokens(USER_ID)

    if (tokens) {
        console.log('found stored tokens in SQLite: ', JSON.stringify(tokens, null, ' '))
        oauth2Client.setCredentials(tokens)
    } else {
        console.log('WARNING, no tokens stored in SQLite')
    }
    
    google.options({ auth: oauth2Client })
}
