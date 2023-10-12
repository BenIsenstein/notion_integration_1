import { oauth2Client } from '../../repositories'
import { setGoogleTokens } from '../../services'
import { USER_ID } from '../../values'

export const authedUserTokensFromGoogleOauthResponseCode = async (req, res) => {
    const { code } = req.query
    const { tokens } = await oauth2Client.getToken(code)
    
    setGoogleTokens(USER_ID, tokens)
    oauth2Client.setCredentials(tokens)

    res.send('Success! You may leave this window now.')
}