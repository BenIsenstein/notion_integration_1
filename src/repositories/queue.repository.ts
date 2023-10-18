import axios from 'axios'

export const queueAxios = axios.create({
    baseURL: process.env.HTTP_QUEUE_URL
})