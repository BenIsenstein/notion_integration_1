import cron from 'node-cron'

export const scheduleWithLog = (expression, func, jobName) => {
    cron.schedule(expression, () => {
        const datetime = Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'long' }).format()
        const label = jobName || func.name || 'Anonymous'
        console.log(`CRON ${label} ${datetime}`)
        func()
    })
}