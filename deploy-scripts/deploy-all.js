const execFile = require('util').promisify(require('child_process').execFile)
const { readdirSync } = require('fs')

const FILENAMES_FOR_OMMISSION = [
    'deploy-all.js',
    'deploy-current-target.js'
]

for (const filename of readdirSync(__dirname)) {
    if (FILENAMES_FOR_OMMISSION.includes(filename)) continue

    console.log(`Running deploy script: ${filename}`)
    await execFile(filename)
}
