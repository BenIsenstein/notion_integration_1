export interface IYoutubeVideo {
    embedHtml: string
    videoId: string
    title: string
    channelTitle: string
    channelId: string
}

export type ChannelsConfig = Array<{
    youtubeId: string
    notionId: string
}>