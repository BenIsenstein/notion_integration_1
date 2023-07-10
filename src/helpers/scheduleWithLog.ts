import cron from 'node-cron'
import { CronJob } from '../types'

export const scheduleWithLog = (job: CronJob) => {
    const [expression, func, jobName] = job
    
    cron.schedule(expression, () => {
        const datetime = Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'long' }).format()
        const label = jobName || func.name || 'Anonymous'
        console.log(`CRON ${label} ${datetime}`)
        func()
    })
}
