interface IContactInfoCommon {
    displayName: string
    phoneNumber?: string
    email?: string
}

export interface IGoogleContactInfo extends IContactInfoCommon {
    googleId: string
    googleEtag: string
}

export interface INotionContactInfo extends IContactInfoCommon {
    notionId: string
}

export interface IDbContactInfo extends IGoogleContactInfo, INotionContactInfo {
    id?: number
}

export interface IContactUpdatePayload {
    action: 'newContact' | 'updateContact' | 'deleteContact'
    contact: IDbContactInfo
}

export interface INotionContactResponse {
    properties: {
        Name: {
        title: {
            plain_text: string
        }[]
        }
        Phone: {
        phone_number: string
        }
        Email: {
        email: string
        }
    },
    id: string
}

export enum CONTACT_SYNC_ERROR_CAUSES {
    UNKNOWN,
    GOOGLE_CONTACTS_ETAGS_NOT_REFRESHED,
    GOOGLE_AUTH_TOKEN_EXPIRED
}