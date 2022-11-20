export const stripEmojis = (str) => str?.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '')
export const stripTags = (str) => str?.replace(/\s<.*>/g, '')