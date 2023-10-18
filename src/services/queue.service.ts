import { HttpJob } from '../types'
import { queueAxios } from '../repositories/queue.repository'

export const createHttpJob = async (job: HttpJob) => {
    const res = await queueAxios.post('/', job)
}
