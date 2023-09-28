export const ARTICLES_BUCKET_NAME = 'notion-articles-bucket-01'
export const NOTION_GMAIL_LABEL_ID = 'Label_3490851710916796679'
export const ONE_HOUR_OF_MILLISECONDS = 60 * 60 * 1000
export const USER_ID = 'ben.isenstein@gmail.com'
export const PUBSUB_TOPIC = 'new-email'
export const PRODUCT_TO_OAUTH_SCOPE_MAP = {
    COMMON: [
        "openid"
    ],
    GMAIL: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email"
    ],
    CONTACTS: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/contacts"
    ],
    YOUTUBE: [
        "https://www.googleapis.com/auth/youtube.readonly"
    ]
}
export const GOOGLE_OAUTH_DEFAULT_SCOPES = [...new Set(
    Object.values(PRODUCT_TO_OAUTH_SCOPE_MAP)
    .reduce((allScopes, currentScopes) => [...allScopes, ...currentScopes])
)]