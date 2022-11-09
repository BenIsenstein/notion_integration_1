const { readdirSync } = require('fs')
const { scheduleWithLog } = require('../helpers')

readdirSync(__dirname).forEach((filename) => {
    const job = require(`${__dirname}/${filename}`)
    if (!Array.isArray(job)) return
    scheduleWithLog(...job)
})