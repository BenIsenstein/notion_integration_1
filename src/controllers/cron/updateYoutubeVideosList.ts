// for testing only:

// const { resolve }  = require('path')
// require("dotenv").config({
//     path: resolve(process.cwd(), '.env.prod')
// })

import {
    checkForNotionVideoPage,
    createNotionVideoPage,
    makeYoutubeChannelsFetcher,
    makeYoutubePlaylistItemsFetcher,
    makeYoutubeVideosFetcher,
    updateNotionPageTitle
} from '../../services'
import {
    useNotionPagination,
    useGooglePagination,
    iYoutubeVideoFromVideoItem,
    LIST_CHANNELS_NOTION_ARGS,
    channelsConfigFromNotionResults
} from '../../helpers'

export const updateYoutubeVideosController = async () => {
    await useNotionPagination(
        LIST_CHANNELS_NOTION_ARGS,
        async (notionChannelsPage) => {
            const channelsConfig = channelsConfigFromNotionResults(notionChannelsPage)
            
            await useGooglePagination(
                makeYoutubeChannelsFetcher(channelsConfig),
                async (youtubeChannelsPage) => {
                    for (const channel of youtubeChannelsPage.data.items) {
                        const channelNotionId = channelsConfig.find(c => c.youtubeId === channel.id).notionId

                        try {
                            await updateNotionPageTitle(channelNotionId, channel.snippet.title)
                        } catch (e) {
                            console.log('CHANNEL UPSERT FAILED: ', e)
                        }

                        await useGooglePagination(
                            makeYoutubePlaylistItemsFetcher(channel),
                            async (youtubePlaylistItemsPage) => {
                                await useGooglePagination(
                                    makeYoutubeVideosFetcher(youtubePlaylistItemsPage),
                                    async (youtubeVideosPage) => {
                                        for (const videoItem of youtubeVideosPage.data.items) {
                                            const video = iYoutubeVideoFromVideoItem(videoItem)

                                            try {
                                                const exists = await checkForNotionVideoPage(video.videoId)
                    
                                                if (exists.results.length) {
                                                    await updateNotionPageTitle(exists.results[0].id, video.title)
                                                } else {
                                                    await createNotionVideoPage(video, channelNotionId)
                                                }
                                            } catch (e) {
                                                console.log('VIDEO UPSERT FAILED: ', e)
                                            }
                                        }
                                    }
                                )
                            }
                        )
                    }
                }
            )
        }
    )
}

// for testing only

// ;(async () => {
//     await require('../../helpers').initGoogleApi()
//     await updateYoutubeVideosController()
// })()
