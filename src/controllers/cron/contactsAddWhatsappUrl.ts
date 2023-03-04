import { isFullPage } from "@notionhq/client"
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { withHandleNotionApiRateLimit } from "../../helpers"
import { notion } from "../../repositories"

export const contactsAddWhatsappUrl = async (req, res) => {
    const query = withHandleNotionApiRateLimit(notion.databases.query)
    const update = withHandleNotionApiRateLimit(notion.pages.update)
    const results: PageObjectResponse[] = []
    let start_cursor: string = undefined
  
    while (true) {
      const res = await query({
        database_id: process.env.CONTACTS_DB_ID,
        start_cursor,
        page_size: 100,
        filter: {
            and: [
                {
                    property: "WhatsApp Msg",
                    url: {
                        equals: ""
                    }
                },
                {
                    property: "Phone",
                    phone_number: {
                        is_not_empty: true
                    }
                }
            ]
        }
      })
  
      results.push(...res.results.filter(isFullPage))
      
      if (res.has_more) {
        start_cursor = res.next_cursor
      }
      else {
        break
      }
    }

    for (const contact of results) {
        try {
            const { id, properties } = contact
            if (properties.Phone.type !== 'phone_number') continue
            const phone = properties.Phone.phone_number.replace(/\+|\-|\s/g, '')

            await update({
                page_id: id,
                properties: {
                    "WhatsApp Msg": `https://api.whatsapp.com/send?phone=${phone}`
                }
            })
        } catch (err) {
            console.log(err)
        }
    }
}
