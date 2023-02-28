import { writeFileSync } from 'fs'
import { oauth2Client } from '../repositories'

export const authedUserTokensFromGoogleOauthResponseCode = async (req, res) => {
    const { code } = req.query
    const { tokens } = await oauth2Client.getToken(code)
    
    writeFileSync('tokens.json', JSON.stringify(tokens))
}