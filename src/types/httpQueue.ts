import { JobsOptions } from 'bullmq'

export interface HttpJob {
    method: 'GET' |'POST' | 'PUT' | 'PATCH' | 'OPTIONS' | 'DELETE',
    url: string,
    headers?: Record<string, string>,
    body?: Record<string, unknown>
}

export interface NewJobRequest {
    job: HttpJob,
    options: JobsOptions
}
