import { APIErrorCode } from "@notionhq/client"
import delay from 'delay'

// handle a rate limit error from the Notion API by delaying based on the retry-after header
const handleNotionApiRateLimit = async (error: any) => {
    if (error.code === APIErrorCode.RateLimited) {
        const retryAfter = error.response.headers['retry-after'] || 1
        console.log(`Notion API rate limit exceeded, retrying after ${retryAfter} seconds`)
        await delay(retryAfter * 1000)
    }
}

export const withHandleNotionApiRateLimit = <
    TArgs extends Array<unknown>,
    TReturn
>(
    fn: (...args: TArgs) => Promise<TReturn>
) => {
    return async (...args: TArgs) => {
        try {
            return await fn(...args)
        }
        catch (error) {
            console.error(error)
            await handleNotionApiRateLimit(error)
            return await fn(...args)
        }

    }
}
