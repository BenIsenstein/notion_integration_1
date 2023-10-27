import { isFullPage } from '@notionhq/client'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { notion } from '../repositories'

export const eraseEmptyJournals = async (req, res) => {
    let code = 204
    let message = 'Success'
    const results: PageObjectResponse[] = []
    let start_cursor: string = undefined
  
    try {
      while (true) {
        const res = await notion.queryDb({
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
    } catch (e) {
      code = 500
      message = `List journal pages error: ${(e as Error).message}`
    }

    for (const page of results) {
        try {
            await notion.deleteBlock({ block_id: page.id })
        } catch (err) {
            console.log(err)
            code = 500
            message = `Delete journal page error: ${(err as Error).message}`
        }
    }

    const tomorrow = new Date()
    tomorrow.setUTCHours(8, 0, 0, 0)
    tomorrow.setDate(tomorrow.getDate() + 1)

    res.header('x-next-execution-ms', tomorrow.getTime())
    res.sendStatus(code).send(message)
}
