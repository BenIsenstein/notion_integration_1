export const getStorageDateString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()

    return `${year}_${month}_${day}`
}