import { youtube_v3 } from "googleapis";
import { ChannelsConfig, IYoutubeVideo } from "../types";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export const CHANNELS_PAGE_SIZE = 50

export const iYoutubeVideoFromVideoItem = (
    videoItem: youtube_v3.Schema$Video
): IYoutubeVideo => ({
    embedHtml: videoItem.player.embedHtml,
    videoId: videoItem.id,
    title: videoItem.snippet.title,
    channelTitle: videoItem.snippet.channelTitle,
    channelId: videoItem.snippet.channelId
})

export const LIST_CHANNELS_NOTION_ARGS = {
    database_id: process.env.YOUTUBE_CHANNELS_DB_ID,
    page_size: CHANNELS_PAGE_SIZE,
}

export const channelsConfigFromNotionResults = (
    notionChannelsPage: PageObjectResponse[]
): ChannelsConfig => (
    notionChannelsPage.map(page => ({
        // @ts-ignore
        youtubeId: page.properties.channelId.rich_text[0].plain_text,
        notionId: page.id
    }))
)