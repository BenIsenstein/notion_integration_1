import { people_v1 } from "googleapis"
import { GaxiosResponse } from "gaxios"
import { CreatePageResponse } from "@notionhq/client/build/src/api-endpoints"
import { notion, people, db } from "../repositories"
import {
    IGoogleContactInfo,
    INotionContactInfo,
    INotionContactResponse,
    IContactUpdatePayload,
    IDbContactInfo,
} from '../types'
import { 
  queryPayloadFromObject, 
  useGooglePagination, 
  useNotionPagination
} from "../helpers"
import { makeInsertQuery, makeUpdateQuery } from '../helpers/sqlite'

const CONTACTS_TABLE_NAME = 'contacts'
const CONTACTS_ROW_KEYS = ['displayName', 'phoneNumber', 'email', 'googleId', 'googleEtag', 'notionId']

const _getDbContacts = db.query('SELECT * from contacts;')
const _insertContact = db.query(makeInsertQuery(CONTACTS_TABLE_NAME, CONTACTS_ROW_KEYS))
const _updateContact = db.query(makeUpdateQuery(CONTACTS_TABLE_NAME, CONTACTS_ROW_KEYS))
const _deleteContact = db.query('DELETE FROM contacts WHERE id = ?1;')

export const getDbContacts = () => _getDbContacts.all() as IDbContactInfo[]

export const insertDbContact = (contact: IDbContactInfo) => _insertContact.run(queryPayloadFromObject(contact))

export const updateDbContact = (contact: IDbContactInfo) => _updateContact.run(queryPayloadFromObject(contact))

export const deleteDbContact = (id: number) => _deleteContact.run(id)

export const getGoogleContacts = async (): Promise<IGoogleContactInfo[]> => {
    const results: IGoogleContactInfo[] = []

    await useGooglePagination(
      (pageToken) => people.people.connections.list({
        resourceName: 'people/me',
        personFields: 'names,emailAddresses,phoneNumbers',
        pageSize: 1000,
        pageToken,
      }),
      async (res) => {
        const contactsPage: IGoogleContactInfo[] = res.data.connections.map((contact) => ({
          displayName: contact?.names?.[0]?.displayName,
          phoneNumber: contact?.phoneNumbers?.[0]?.canonicalForm || contact?.phoneNumbers?.[0]?.value,
          email: contact?.emailAddresses?.[0]?.value,
          googleId: contact?.resourceName,
          googleEtag: contact?.etag,
        }))

        results.push(...contactsPage)
      }
    )
  
    return results
}

export const getNotionContacts = async (): Promise<INotionContactInfo[]> => {
    const results: INotionContactInfo[] = []
    
    await useNotionPagination(
      {
        database_id: process.env.CONTACTS_DB_ID,
        page_size: 100,
      },
      async (contactsResults) => {
        const contactsPage: INotionContactInfo[] = 
          (contactsResults as unknown as INotionContactResponse[]).map((contact) => ({
            displayName: contact?.properties?.Name?.title?.[0]?.plain_text,
            phoneNumber: contact?.properties?.Phone?.phone_number,
            email: contact?.properties?.Email?.email,
            notionId: contact?.id,
          }))
        
        results.push(...contactsPage)
      }
    )
  
    return results
}

export const createGoogleContact = async (
    contact: IContactUpdatePayload["contact"]
): Promise<
    GaxiosResponse<people_v1.Schema$Person>
> => {
    const { displayName, phoneNumber, email } = contact
    const [ givenName, ...rest ] = displayName.split(' ')
    const familyName = rest?.join(' ') || null

    return await people.people.createContact({
        requestBody: {
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

export const updateGoogleContact = async (
    contact: IContactUpdatePayload["contact"]
): Promise<
    GaxiosResponse<people_v1.Schema$Person>
> => {
    const { displayName, phoneNumber, email, googleId, googleEtag } = contact as IDbContactInfo
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
    const { displayName, phoneNumber, email } = contact

    return await notion.createPage({
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
    const { displayName, phoneNumber, email, notionId } = contact as INotionContactInfo

    return await notion.updatePage({
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
  const googleContacts = await getGoogleContacts()
  const _updateEtag = db.query('UPDATE contacts SET googleEtag = ?1 WHERE googleId = ?2;')

  for (const index in googleContacts) {
    console.log(`updating contact ${+index + 1} of ${googleContacts.length}...`)
    _updateEtag.run(googleContacts[index].googleEtag, googleContacts[index].googleId)
  }
}
