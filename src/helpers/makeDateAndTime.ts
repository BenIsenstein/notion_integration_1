export const makeDateAndTime = () => {
    const date = Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format()
    const time = Intl.DateTimeFormat('en-US', { timeStyle: 'long' }).format()
    const timestamp = Date.now()

    return {
        date,
        time,
        timestamp
    }
}