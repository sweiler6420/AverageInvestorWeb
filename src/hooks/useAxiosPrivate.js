import { axiosPrivate } from "../axios/axios"
import { useEffect } from "react"
import useAuth from "./useAuth"
import { useNavigate } from 'react-router-dom'

export default function useAxiosPrivate() {
    const { auth, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${auth?.access_token}`
                }
                
                return config
            }, (error) => Promise.reject(error)
        )

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                if(error?.response?.status === 403){
                    logout()
                    navigate('/login')
                }
                return Promise.reject(error)
            } 
        )

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept)
            axiosPrivate.interceptors.response.eject(responseIntercept)
        }
    }, [auth])

    return axiosPrivate
}

