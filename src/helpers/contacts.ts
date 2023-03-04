import { CONTACT_SYNC_ERROR_CAUSES, IContactUpdatePayload } from "../types/contacts"

export const isContactEmpty = (contact: IContactUpdatePayload["contact"]) => {
    return !contact.displayName || (!contact.phoneNumber && !contact.email)
}

export const determineCauseOfError = (error: Error): CONTACT_SYNC_ERROR_CAUSES => {
    if (error.message.includes("reading 'access_token'")) {
        return CONTACT_SYNC_ERROR_CAUSES.GOOGLE_AUTH_TOKEN_EXPIRED
    }
    return CONTACT_SYNC_ERROR_CAUSES.UNKNOWN
}

export const wasSameUpdateMadeInGoogle = (
    notionUpdate: IContactUpdatePayload,
    googleUpdates: IContactUpdatePayload[]
) => {
    return !!googleUpdates.find((googleUpdate) => 
        notionUpdate.action === googleUpdate.action &&
        !hasContactInfoChanged(notionUpdate.contact, googleUpdate.contact)
    )
}

export const wasSameUpdateMadeInNotion = (
    googleUpdate: IContactUpdatePayload,
    notionUpdates: IContactUpdatePayload[]
) => {
    return !!notionUpdates.find((notionUpdate) => 
        notionUpdate.action === googleUpdate.action &&
        !hasContactInfoChanged(notionUpdate.contact, googleUpdate.contact)
    )
}

export const hasContactInfoChanged = (contact1, contact2) => {
    return contact1.displayName !== contact2.displayName ||
        contact1.phoneNumber !== contact2.phoneNumber ||
        contact1.email !== contact2.email
}

export const mergeIdenticalContactUpdate = (
    notionUpdate: IContactUpdatePayload,
    googleUpdate: IContactUpdatePayload
): IContactUpdatePayload => {
    return {
        action: notionUpdate.action,
        contact: {
            ...notionUpdate.contact,
            ...googleUpdate.contact
        }
    }
}