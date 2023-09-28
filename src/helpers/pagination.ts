import { GaxiosResponse, GaxiosPromise } from 'gaxios'
import { isFullPage } from '@notionhq/client'
import { PageObjectResponse, QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints'
import { notion } from '../repositories'

export const useNotionPagination = async (
    args: QueryDatabaseParameters,
    callback: (results: PageObjectResponse[]) => Promise<void>
): Promise<void> => {
    let start_cursor: string = undefined

    while (true) {
        const res = await notion.queryDb({ ...args, start_cursor })

        await callback(res.results.filter(isFullPage))
        
        if (res.has_more) {
            start_cursor = res.next_cursor
        }
        else {
            break
        }
    }
}

export const useGooglePagination = async <T>(
    fetchData: (pageToken: string) => GaxiosPromise<T>,
    callback: (data: GaxiosResponse<T>) => Promise<void>
): Promise<void> => {
    let pageToken: string = ''

    while (true) {
        const res = await fetchData(pageToken)

        await callback(res)

        // @ts-ignore
        const nextPageToken: string = res.data.nextPageToken

        if (nextPageToken) {
            pageToken = nextPageToken
        }
        else {
            break
        }
    }
}
