import { Document } from "mongodb"

interface IContactInfoCommon {
    displayName: string
    phoneNumber?: string
    email?: string
}

export interface IGoogleContactInfo extends IContactInfoCommon {
    googleId: string
    googleEtag: string
    [key: string]: string
}

export interface INotionContactInfo extends IContactInfoCommon {
    notionId: string
    [key: string]: string
}

export interface IMongoDbContactInfo extends Document, IContactInfoCommon, IGoogleContactInfo, INotionContactInfo {}

export interface IContactUpdatePayload {
    action: 'newContact' | 'updateContact' | 'deleteContact'
    contact: IMongoDbContactInfo | IGoogleContactInfo | INotionContactInfo
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
}