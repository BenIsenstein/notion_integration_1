const cron = require('node-cron')

module.exports.scheduleWithLog = (expression, func, jobName) => {
    cron.schedule(expression, () => {
        const datetime = Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'long' }).format()
        const label = jobName || func.name || 'Anonymous'
        console.log(`Node Cron -> "${label}" -> ${datetime}`)
        func()
    })
}