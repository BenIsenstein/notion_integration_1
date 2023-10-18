import { notion, people } from '../repositories'
import {
  determineCauseOfError,
  hasContactInfoChanged,
  isContactEmpty,
  mergeIdenticalContactUpdate,
  wasSameUpdateMadeInGoogle,
  wasSameUpdateMadeInNotion
} from '../helpers'
import {
  getGoogleContacts,
  getNotionContacts,
  createGoogleContact,
  createNotionContact,
  updateGoogleContact,
  updateNotionContact,
  refreshGoogleContactsEtags,
  sendAuthTokenResetEmail,
  getDbContacts,
  insertDbContact,
  updateDbContact,
  deleteDbContact,
  createHttpJob
} from '../services'
import { CONTACT_SYNC_ERROR_CAUSES, IContactUpdatePayload } from '../types'

const syncContactsController = async () => {
  const successfulUpdates: Map<IContactUpdatePayload, null> = new Map()
  const googleIdToEtagRecord: Record<string, string> = {}

  try {
    const dbContacts = getDbContacts()
    const googleContacts = await getGoogleContacts()
    const notionContacts = await getNotionContacts()
    const notionContactUpdates: IContactUpdatePayload[] = []
    const googleContactUpdates: IContactUpdatePayload[] = []
    const commonContactUpdates: IContactUpdatePayload[] = []

    // populate googleIdToEtag
    for (const contact of googleContacts) {
      googleIdToEtagRecord[contact.googleId] = contact.googleEtag
    }
    
    // determine updates that have taken place in notion
    for (const contact of notionContacts) {
      if (isContactEmpty(contact)) continue
      const mongoDbContact = dbContacts.find((mongoDbContact) => mongoDbContact.notionId === contact.notionId)

      for (const key in contact) {
        if (!contact[key]) contact[key] = null
      }

      if (!mongoDbContact) {
        // @ts-ignore
        notionContactUpdates.push({ action: 'newContact', contact })
      }
      else if (hasContactInfoChanged(contact, mongoDbContact)) {
        notionContactUpdates.push({ action: 'updateContact', contact: { ...mongoDbContact, ...contact } })
      }
    }

    // determine updates that have taken place in google
    for (const contact of googleContacts) {
      if (isContactEmpty(contact)) continue
      const mongoDbContact = dbContacts.find((mongoDbContact) => mongoDbContact.googleId === contact.googleId)

      for (const key in contact) {
        if (!contact[key]) contact[key] = null
      }

      if (!mongoDbContact) {
        // @ts-ignore
        googleContactUpdates.push({ action: 'newContact', contact })
      }
      else if (hasContactInfoChanged(contact, mongoDbContact)) {
        googleContactUpdates.push({ action: 'updateContact', contact: { ...mongoDbContact, ...contact } })
      }
    }

    // determine deletes that have taken place in both platforms
    for (const contact of dbContacts) {
      const isContactInNotion = !!notionContacts.find((notionContact) => notionContact.notionId === contact.notionId)
      const isContactInGoogle = !!googleContacts.find((googleContact) => googleContact.googleId === contact.googleId)

      if (!isContactInNotion) {
        notionContactUpdates.push({ action: 'deleteContact', contact })
      }
      if (!isContactInGoogle) {
        googleContactUpdates.push({ action: 'deleteContact', contact })
      }
    }

    // determine common updates between both platforms
    for (const notionUpdate of notionContactUpdates) {
      if (!wasSameUpdateMadeInGoogle(notionUpdate, googleContactUpdates)) continue

      const googleUpdate = googleContactUpdates.find((googleUpdate) => 
        notionUpdate.action === googleUpdate.action &&
        !hasContactInfoChanged(notionUpdate.contact, googleUpdate.contact)
      )
      const commonUpdate = mergeIdenticalContactUpdate(notionUpdate, googleUpdate)

      commonContactUpdates.push(commonUpdate)
      successfulUpdates.set(commonUpdate, null)
    }

    // sync notion updates to google
    for (const notionUpdate of notionContactUpdates) {
      if (wasSameUpdateMadeInGoogle(notionUpdate, googleContactUpdates)) continue

      if (notionUpdate.action === 'newContact') {
        const { resourceName, etag } = (await createGoogleContact(notionUpdate.contact)).data
        notionUpdate.contact.googleId = resourceName
        notionUpdate.contact.googleEtag = etag
      }
      else if (notionUpdate.action === 'updateContact') {
        notionUpdate.contact.googleEtag = googleIdToEtagRecord[notionUpdate.contact.googleId]
        const { etag } = (await updateGoogleContact(notionUpdate.contact)).data
        googleIdToEtagRecord[notionUpdate.contact.googleId] = etag
      }
      else if (notionUpdate.action === 'deleteContact') {
        await people.people.deleteContact({ resourceName: notionUpdate.contact.googleId })
      }

      successfulUpdates.set(notionUpdate, null)
    }

    // sync google updates to notion
    for (const googleUpdate of googleContactUpdates) {
      if (wasSameUpdateMadeInNotion(googleUpdate, notionContactUpdates)) continue

      if (googleUpdate.action === 'newContact') {
        const { id } = await createNotionContact(googleUpdate.contact)
        googleUpdate.contact.notionId = id
      }
      else if (googleUpdate.action === 'updateContact') {
        await updateNotionContact(googleUpdate.contact)
      }
      else if (googleUpdate.action === 'deleteContact') {
        await notion.deleteBlock({ block_id: googleUpdate.contact.notionId })
      }

      successfulUpdates.set(googleUpdate, null)
    }

    // sync all updates to mongo
    for (const commonUpdate of successfulUpdates.keys()) {
      if (commonUpdate.action === 'newContact') {
        insertDbContact(commonUpdate.contact)
      }
      else if (commonUpdate.action === 'updateContact') {
        commonUpdate.contact.googleEtag = googleIdToEtagRecord[commonUpdate.contact.googleId]
        updateDbContact(commonUpdate.contact)
      }
      else if (commonUpdate.action === 'deleteContact') {
        deleteDbContact(commonUpdate.contact.id!)
      }

      successfulUpdates.delete(commonUpdate)
    }
  }
  catch (error) {
    try {
      // commit everything to mongo that synced before the error
      for (const commonUpdate of successfulUpdates.keys()) {
        if (commonUpdate.action === 'newContact') {
          insertDbContact(commonUpdate.contact)
        }
        else if (commonUpdate.action === 'updateContact') {
          commonUpdate.contact.googleEtag = googleIdToEtagRecord[commonUpdate.contact.googleId]
          updateDbContact(commonUpdate.contact)
        }
        else if (commonUpdate.action === 'deleteContact') {
          deleteDbContact(commonUpdate.contact.id!)
        }

        successfulUpdates.delete(commonUpdate)
      }

      console.log(error)
      throw new Error(error.message)
    }
    catch (error) {
      console.log(error)
      throw new Error(error.message)
    }
  }
}

export const syncContactsBetweenNotionAndGoogle = async (req, res) => {
  let code = 204
  let message = 'Success'
  const timeReceived = Date.now()

  try {
    await syncContactsController()
  }
  catch (error) {
    const { message: err1Message, stack } = error
    const causeOfError = determineCauseOfError(error)

    console.log({ message: err1Message, stack })
    //await insertError('contacts-sync-errors', error)

    if (causeOfError === CONTACT_SYNC_ERROR_CAUSES.GOOGLE_CONTACTS_ETAGS_NOT_REFRESHED) {
      await refreshGoogleContactsEtags()
    }

    if (causeOfError === CONTACT_SYNC_ERROR_CAUSES.GOOGLE_AUTH_TOKEN_EXPIRED) {
      await sendAuthTokenResetEmail()
    }

    try {
      await syncContactsController()
    }
    catch (err) {
      const { message: err2Message, stack } = err
      console.log({ message: err2Message, stack })
      message = err2Message
      code = 500
      //await insertError('contacts-sync-errors-after-fix-attempt', error)
    }
  }

  try {
    createHttpJob({
      method: 'POST',
      url: `${process.env.WEB_API_URL}/contacts-sync-runs`,
      executionTime: timeReceived + 300000
    })
  } catch (e) {
    console.log('Error enqueuing new contacts sync job: ', e)
  }

  res.sendStatus(code).send(message)
}
