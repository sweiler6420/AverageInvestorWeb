import { useContext } from 'react'
import axios from '../axios/axios'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import ErrorsContext from '../ErrorsContext'

export default function useApi() {
    const axiosPrivate = useAxiosPrivate()
    const {setError} = useContext(ErrorsContext)

    return {
        apiGet: apiGetFunction.bind(null, axiosPrivate, setError),
        apiPost: apiPostFunction.bind(null, axiosPrivate, setError),
        // apiDelete: apiCall.bind(null, 'delete'),
        // apiPut: apiCall.bind(null, 'put'),
        apiLogin: apiLoginFunction.bind(null, setError),
        apiSignUp: apiSignUpFunction.bind(null, setError),
        apiRecovery: apiRecoveryFunction.bind(null, setError),
    }
}

export const apiLoginFunction = async (setError, endpoint, _params={})=> {
    const {rawResponse=false, ...params} = _params
    
    // OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
    const form_data = new URLSearchParams()
    form_data.append("username", params.username)
    form_data.append("password", params.password)

    try{
        const response = await axios.post(endpoint, form_data.toString(), {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return {data: response.data, status: response.status}
    } catch (err) {
        if(!err?.response){
            // Network error or server not responding
            if(err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')){
                setError("No Server Response - Check if server is running")
            } else {
                setError("No Server Response")
            }
        }
        else if(err?.response?.status === 404 || err?.response?.status === 403){
            setError(err?.response?.data?.detail)
        }
        else{
            setError("Login Failed")
        }
        return {"status": err?.response?.status, "message": err?.message, "error": err?.name, "detail": err?.response?.data?.detail}
    }

}


export const apiSignUpFunction = async (setError, endpoint, _params={})=> {
    const {rawResponse=false, ...params} = _params

    try{
        const response = await axios.post(endpoint, params)
        return {data: response.data, status: response.status}
    } catch (err) {
        if(err?.request?.status === 403){
            setError(err?.response?.data?.detail)
        } else if (err?.request?.status === 422){
            console.log(err.response)
        }
        return {"status": err.request?.status, "message": err.message, "error": err.name, "detail": err?.response?.data?.detail}
    }

}

export const apiRecoveryFunction = async (setError, endpoint, _params={})=> {
    const {rawResponse=false, ...params} = _params

    try{
        const response = await axios.post(endpoint, params)
        return {data: response.data, status: response.status}
    } catch (err) {
        if(!err?.response){
            setError("No Server Response")
        }
        else if(err?.response?.status === 404){
            setError("User Not Found")
        }
        else{
            setError("Recovery request failed")
        }
        return {"status": err?.response?.status, "message": err?.message, "error": err?.name, "detail": err?.response?.data?.detail}
    }
}

export const apiGetFunction = async (axiosPrivate, setError, endpoint, _params={})=> {
    const { rawResponse = false, ...params } = _params;

    if (Object.keys(params).length > 0){
        const uriQuery = `?${URIEncodeObject(params)}`;
        endpoint = `${endpoint}${uriQuery}`;
    }

    try{
        const response = await axiosPrivate.get(endpoint)
        
        return {data: response.data, status: response.status}
    } catch (err) {
        console.log(err)
        return {"status": err.request?.status, "message": err.message, "error": err.name}
    }

}


export const apiPostFunction = async (axiosPrivate, setError, endpoint, _params = {}, config = {}) => {
    const { rawResponse = false, ...params } = _params;

    const uriQuery = `?${URIEncodeObject(params)}`;
    const url = `${endpoint}${uriQuery}`;

    try {
        const response = await axiosPrivate.post(url, _params, config);
        return {data: response.data, status: response.status};
    } catch (err) {
        console.log(err);
        return { "status": err.request?.status, "message": err.message, "error": err.name };
    }
};

function URIEncodeObject(o){
    return Object.entries(cleanObject(o))
        .map( ([key, val])=> encodeURIComponent(key) + '=' + encodeURIComponent(val) )
        .join('&')
}

function cleanObject(o) {
    return Object.entries(o).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            acc[key] = value;
        }
        return acc;
    }, {});
}

function URIEncodeBody(body){
    return Object.keys(body).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(body[key])).join('&')
}
