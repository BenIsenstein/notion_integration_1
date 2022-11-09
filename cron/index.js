const { readdirSync } = require('fs')
const { scheduleWithLog } = require('../helpers')

console.log('Starting Cron Jobs:\n\n')
readdirSync(__dirname).forEach((filename) => {
    const job = require(`${__dirname}/${filename}`)
    if (!Array.isArray(job)) return

    console.log(filename)
    scheduleWithLog(...job)
})
console.log('')