import axios from '../axios/axios';
import useAuth from './useAuth';
import { useNavigate, useLocation } from "react-router-dom"

const useRefreshToken = () => {
    const { setAuth } = useAuth();
    const navigate = useNavigate()
    const location = useLocation()

    const refresh = async () => {
        try{
            // Get refresh token from localStorage (stored during login)
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const formData = new FormData();
            formData.append('refresh_token', refreshToken);
            
            const response = await axios.post('v1/refresh', formData, {
                withCredentials: true
            })
            
            const newAccessToken = response.data.access_token;
            const newRefreshToken = response.data.refresh_token;
            
            // Store refresh token in localStorage for persistence
            localStorage.setItem('refresh_token', newRefreshToken);
            
            setAuth(prev => {
                return { 
                    ...prev, 
                    roles: prev.roles || 2001, // Preserve roles if they exist
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                }
            });
            return newAccessToken;
        } catch(err) {
            console.log(err)
            // Clear stored refresh token on failure
            localStorage.removeItem('refresh_token');
            if(err?.response?.status === 403 || err?.response?.status === 401){
                setAuth({});
                navigate('/login', { state: { from: location }, replace: true })
            }
            throw err;
        }
    }
    return refresh;
};

export default useRefreshToken;

