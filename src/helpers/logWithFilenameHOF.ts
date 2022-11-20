export const logWithFilenameHOF = (filename) => {
    return (str) => {
        console.log(`"${filename}"`)
        console.log('- '.repeat((filename.length + 2) / 2))
        console.log(str)
        console.log('')
    }
}
