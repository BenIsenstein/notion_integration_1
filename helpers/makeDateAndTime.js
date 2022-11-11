module.exports.makeDateAndTime = () => {
    const date = Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format()
    const time = Intl.DateTimeFormat('en-US', { timeStyle: 'long' }).format()

    return {
        date,
        time
    }
}