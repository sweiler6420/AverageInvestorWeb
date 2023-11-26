import { axiosPrivate } from "../axios/axios"
import { useEffect } from "react"
import useAuth from "./useAuth"

export default function useAxiosPrivate() {
    const { auth } = useAuth()

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${auth?.access_token}`
                }
                return config
            }, (error) => Promise.reject(error)
        )

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept)
        }
    }, [auth])

    return axiosPrivate
}

