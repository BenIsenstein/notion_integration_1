import { people_v1 } from "googleapis"
import { GaxiosResponse } from "gaxios"
import { CreatePageResponse } from "@notionhq/client/build/src/api-endpoints"
import { isFullPage } from '@notionhq/client'
import { notion, openCollection, people } from "../repositories"
import {
    IGoogleContactInfo,
    INotionContactInfo,
    INotionContactResponse,
    IContactUpdatePayload,
    IMongoDbContactInfo,
} from '../types'
import { withHandleNotionApiRateLimit } from "../helpers"

export const getGoogleContacts = async (): Promise<IGoogleContactInfo[]> => {
    const results: IGoogleContactInfo[] = []
    let pageToken: string = ''
  
    while (true) {
      const res = await people.people.connections.list({
        resourceName: 'people/me',
        personFields: 'names,emailAddresses,phoneNumbers',
        pageSize: 1000,
        pageToken,
      })
      const contactsPage: IGoogleContactInfo[] = res.data.connections.map((contact) => ({
        displayName: contact?.names?.[0]?.displayName,
        phoneNumber: contact?.phoneNumbers?.[0]?.canonicalForm || contact?.phoneNumbers?.[0]?.value,
        email: contact?.emailAddresses?.[0]?.value,
        googleId: contact?.resourceName,
        googleEtag: contact?.etag,
      }))
      const nextPageToken = res.data.nextPageToken
  
      results.push(...contactsPage)
  
      if (nextPageToken) {
        pageToken = nextPageToken
      }
      else {
        break
      }
    }
  
    return results
}

export const getNotionContacts = async (): Promise<INotionContactInfo[]> => {
    const query = withHandleNotionApiRateLimit(notion.databases.query)
    const results: INotionContactInfo[] = []
    let start_cursor: string = undefined
  
    while (true) {
      const res = await query({
        database_id: process.env.CONTACTS_DB_ID,
        start_cursor,
        page_size: 100,
      })
      const contactsPage: INotionContactInfo[] = 
        (res.results.filter(isFullPage) as unknown as INotionContactResponse[]).map((contact) => ({
          displayName: contact?.properties?.Name?.title?.[0]?.plain_text,
          phoneNumber: contact?.properties?.Phone?.phone_number,
          email: contact?.properties?.Email?.email,
          notionId: contact?.id,
        }))
  
      results.push(...contactsPage)
      
      if (res.has_more) {
        start_cursor = res.next_cursor
      }
      else {
        break
      }
    }
  
    return results
}

export const createGoogleContact = async (
    contact: IContactUpdatePayload["contact"]
): Promise<
    GaxiosResponse<people_v1.Schema$Person>
> => {
    const { displayName, phoneNumber, email } = contact

    return await people.people.createContact({
        requestBody: {
          names: [
            {
              displayName,
            },
          ],
          emailAddresses: [
            {
              value: email,
            },
          ],
          phoneNumbers: [
            {
              value: phoneNumber,
            },
          ],
        },
    })
}

export const updateGoogleContact = async (
    contact: IContactUpdatePayload["contact"]
): Promise<
    GaxiosResponse<people_v1.Schema$Person>
> => {
    const { displayName, phoneNumber, email, googleId, googleEtag } = contact
    const [ givenName, ...rest ] = displayName.split(' ')
    const familyName = rest?.join(' ') || null
    
    return await people.people.updateContact({
        resourceName: googleId,
        updatePersonFields: 'names,emailAddresses,phoneNumbers',
        requestBody: {
          etag: googleEtag,
          names: [
            {
              givenName,
              familyName,
            },
          ],
          emailAddresses: [
            {
              value: email,
            },
          ],
          phoneNumbers: [
            {
              value: phoneNumber,
            },
          ],
        },
      })
}

export const createNotionContact = async (
    contact: IContactUpdatePayload["contact"]
): Promise<CreatePageResponse> => {
    const create = withHandleNotionApiRateLimit(notion.pages.create)
    const { displayName, phoneNumber, email } = contact

    return await create({
        parent: {
          database_id: process.env.CONTACTS_DB_ID,
        },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: displayName,
                },
              },
            ],
          },
          Phone: {
            phone_number: phoneNumber,
          },
          Email: {
            email,
          },
        },
    })
}

export const updateNotionContact = async (
    contact: IContactUpdatePayload["contact"]
): Promise<CreatePageResponse> => {
    const update = withHandleNotionApiRateLimit(notion.pages.update)
    const { displayName, phoneNumber, email, notionId } = contact

    return await update({
        page_id: notionId,
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: displayName,
                },
              },
            ],
          },
          Phone: {
            phone_number: phoneNumber,
          },
          Email: {
            email,
          },
        },
    })
}

export const refreshGoogleContactsEtags = async () => {
    console.log('--- refreshing google contacts etags ---\n\n')
    const { collection: contacts, close } = await openCollection<IMongoDbContactInfo>('prod', 'contacts')
    const googleContacts = await getGoogleContacts()
  
    for (const index in googleContacts) {
      console.log(`updating contact ${+index + 1} of ${googleContacts.length}...`)
      const { googleId, googleEtag } = googleContacts[index]
      await contacts.updateOne({ googleId }, { $set: { googleEtag }})
    }
  
    await close()
}