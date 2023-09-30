import { useState, useContext } from 'react'
import appConfig from '../app-config.json'
import ErrorsContext from "../ErrorsContext";
import { useAuthHeader} from 'react-auth-kit'

export default function useApi() {
    const { setError } = useContext(ErrorsContext)
    const token = useAuthHeader()

    return {
        apiGet: apiCall.bind(null, 'get', token, setError,),
        apiPost: apiCall.bind(null, 'post', token, setError),
        apiDelete: apiCall.bind(null, 'delete', token, setError),
        apiPut: apiCall.bind(null, 'put', token, setError),
    }
}

export const apiCall = async (method, token, setError, endpoint, _params={})=> {
    const {rawResponse=false, ...params} = _params

    const isGet = method === 'get',
          isPost = method === 'post',
          isPut = method === 'put',
          isDelete = method === 'delete',
          login = endpoint === 'v1/login',
          signup = endpoint === 'v1/users'

    setError([])

    if (isPost && login) {
        const body = URIEncodeBody(params)
        const url = `${appConfig.apiUri}/${endpoint}`
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }

        try {
            const response = await fetch(url, {method, headers, body})

            if (response.status >= 200 && response.status < 300) {
                try {
                    const response_json = await response.json()
                    return response_json
                }catch(e) {
                    setError(e)
                    console.log(e)
                }
            }
            if (response.status === 403) {
                try {
                    const response_json = await response.json()
                    setError(response_json.detail)
                    return response_json
                }catch(e) {
                    setError(e)
                    console.log(e)
                }
            }
        } catch (e) {
            console.log('>>>>>> Caught ERROR', e)
            setError(e)
            throw e
        }
       
    }

    if (isPost && signup) {
        const body = JSON.stringify(params)
        const url = `${appConfig.apiUri}/${endpoint}`
        const headers = { 'Content-Type': 'application/json' }

        try {
            const response = await fetch(url, {method, headers, body})

            if (response.status >= 200 && response.status < 300) {
                try {
                    const response_json = await response.json()
                    return response_json
                }catch(e) {
                    setError(e)
                    console.log(e)
                }
            }
            if (response.status === 403) {
                try {
                    const response_json = await response.json()
                    setError(response_json.detail)
                    return response_json
                }catch(e) {
                    setError(e)
                    console.log(e)
                }
            }
        } catch (e) {
            console.log('>>>>>> Caught ERROR', e)
            setError(e)
            throw e
        }
       
    }

    if (isGet) {
        const uriQuery = `?${URIEncodeObject(params)}`
        const url = `${appConfig.apiUri}/${endpoint}${uriQuery}`
        const headers = { 'Content-Type': 'application/json' }
        const body = undefined
        
        if(token()) headers['Authorization'] = token()

        try {
            const response = await fetch(url, {method, headers, body})

            if (response.status >= 200 && response.status < 300) {
                try {
                    const response_json = await response.json()
                    return response_json
                }catch(e) {
                    setError(e)
                    console.log(e)
                }
            }
            if (response.status === 403) {
                try {
                    const response_json = await response.json()
                    setError(response_json.detail)
                    return response_json
                }catch(e) {
                    setError(e)
                    console.log(e)
                }
            }
        } catch (e) {
            console.log('>>>>>> Caught ERROR', e)
            setError(e)
            throw e
        }
    }
}

function refreshTokens(){
    window.alert('Your session is stale. Press OK to reload.')
    window.location.reload()
}

function URIEncodeObject(o){
    return Object.entries(o)
        .map( ([key, val])=> encodeURIComponent(key) + '=' + encodeURIComponent(val) )
        .join('&')
}

function URIEncodeBody(body){
    return Object.keys(body).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(body[key])).join('&')
}
