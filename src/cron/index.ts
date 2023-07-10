import { readdirSync } from 'fs'
import { scheduleWithLog } from '../helpers'
import { CronJob } from '../types'

export const startJobs = () => {
    console.log('Starting Cron Jobs:\n')
    readdirSync(__dirname).forEach((filename) => {
        const job: CronJob = require(`${__dirname}/${filename}`).default
        if (!Array.isArray(job)) return

        console.log(filename)
        scheduleWithLog(job)
    })
    console.log('')
}