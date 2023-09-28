import axios from 'axios'
import { GaxiosResponse } from 'gaxios'
import { youtube_v3 } from 'googleapis'
import { youtube, notion } from '../repositories'
import { ChannelsConfig, IYoutubeVideo } from '../types'

export const searchChannels = async (q: string) => {
    try {
        const channels = await youtube.search.list({
            part: ['snippet'],
            type: ['channel'],
            q
        })

        return channels.data.items
    } catch {
        return []
    }
}

export const channelIdFromCustomUrl = async (segment: string) => {
    try {
        const res = await axios.get(`https://www.youtube.com/@${segment}`)
        return res.data.match(/\/channel\/([^"]+)"/)[1]
    } catch (e) {
        console.log('ERROR GETTING CHANNEL ID FROM NAME: ', e)
        return ''
    }
}

export const checkForNotionVideoPage = async (videoId: string) => {
    return await notion.queryDb({
        database_id: process.env.YOUTUBE_VIDEOS_DB_ID,
        page_size: 1,
        filter: {
            property: 'videoId',
            rich_text: { equals: videoId }
        }
    })
}

export const makeYoutubeChannelsFetcher = (channelsConfig: ChannelsConfig) => (
    (pageToken: string) => youtube.channels.list({
        id: channelsConfig.map(c => c.youtubeId),
        part: ['contentDetails', 'snippet'],
        pageToken
    })
)

export const updateNotionPageTitle = async (page_id: string, titleContent: string ) => {
    await notion.updatePage({
        page_id,
        properties: { 'Title': { title: [{ text: { content: titleContent }}]}}
    })
}

export const makeYoutubePlaylistItemsFetcher = (channel: youtube_v3.Schema$Channel) => (
    (pageToken: string) => youtube.playlistItems.list({
        playlistId: channel.contentDetails.relatedPlaylists.uploads,
        part: ['contentDetails'],
        maxResults: 50,
        pageToken
    })
)

export const makeYoutubeVideosFetcher = (
    playlistItemsPage: GaxiosResponse<youtube_v3.Schema$PlaylistItemListResponse>
) => (
    (pageToken: string) => youtube.videos.list({
        id: playlistItemsPage.data.items.map(i => i.contentDetails.videoId),
        part: ['snippet', 'player'],
        pageToken
    })
)

export const createNotionVideoPage = async (video: IYoutubeVideo, channelNotionId: string) => {
    await notion.createPage({
        parent: { database_id: process.env.YOUTUBE_VIDEOS_DB_ID },
        properties: {
            Title: { title: [{ text: { content: video.title }}]},
            videoId: { rich_text: [{ text: { content: video.videoId }}]},
            embed: { rich_text: [{ text: { content: video.embedHtml }}]},
            Channel: { relation: [{ id: channelNotionId }]}
        },
        children: [
            {
                type: 'embed',
                embed: { url: video.embedHtml.match(/src="([^"]+)"/)[1] }
            }
        ]
    })
}