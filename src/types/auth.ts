import { Credentials } from 'google-auth-library'

export interface IGoogleTokensDocument {
    userId: string
    tokens: Credentials
}