import { readdirSync } from 'fs'
import { scheduleWithLog } from '../helpers'

export const startJobs = () => {
    console.log('Starting Cron Jobs:\n')
    readdirSync(__dirname).forEach((filename) => {
        const job: [any, any, any] = require(`${__dirname}/${filename}`).default
        if (!Array.isArray(job)) return

        console.log(filename)
        scheduleWithLog(...job)
    })
    console.log('')
}