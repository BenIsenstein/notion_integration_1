import { isFullPage } from '@notionhq/client'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { notion } from '../../repositories'
import { withHandleNotionApiRateLimit } from "../../helpers"

export const eraseEmptyJournals = async () => {
    const query = withHandleNotionApiRateLimit(notion.databases.query)
    const del = withHandleNotionApiRateLimit(notion.blocks.delete)

    const results: PageObjectResponse[] = []
    let start_cursor: string = undefined
  
    while (true) {
      const res = await query({
        database_id: process.env.NOTEBOOK_DB_ID,
        start_cursor,
        page_size: 100,
        filter: {
            or: [
                {
                    property: "Tags",
                    multi_select: {
                        contains: "Journal"
                    }
                },
                {
                    property: "Tags",
                    multi_select: {
                        contains: "Goals journal"
                    }
                }
            ]
        }
      })
  
      results.push(...res.results.filter(isFullPage).filter(page => {
        // @ts-ignore
        return page.properties.Created.created_time === page.properties["Last edited"].last_edited_time
      }))
      
      if (res.has_more) {
        start_cursor = res.next_cursor
      }
      else {
        break
      }
    }

    for (const page of results) {
        try {
            await del({ block_id: page.id })
        } catch (err) {
            console.log(err)
        }
    }
}
