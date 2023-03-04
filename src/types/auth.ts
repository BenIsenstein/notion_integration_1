import { Credentials } from 'google-auth-library'

export { Credentials }

export interface IGoogleTokensDocument {
    userId: string
    tokens: Credentials
}