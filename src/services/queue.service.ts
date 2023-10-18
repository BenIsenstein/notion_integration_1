import { HttpJob } from '../types'
import { queueAxios } from '../repositories/queue.repository'

export const createHttpJob = async (job: HttpJob) => {
    const res = await queueAxios.post('/', job)
    console.log('creating new http job:', job.method, job.url)
    console.log('queue service res:', res.status, res.statusText)
}
