import axios from 'axios'
import appConfig from '../app-config.json'

const BASE_URL = `${appConfig.apiUri}`


export default axios.create({
    baseURL: BASE_URL
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});