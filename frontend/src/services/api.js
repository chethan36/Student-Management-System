import axios from 'axios'
const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'/api'})
api.interceptors.request.use(config=>{const token=sessionStorage.getItem('sms_token');if(token)config.headers.Authorization=`Bearer ${token}`;return config})
api.interceptors.response.use(r=>r,e=>{if(e.response?.status===401){sessionStorage.clear();location.href='/login'}return Promise.reject(e)})
export const errorMessage=e=>e.response?.data?.message||'Something went wrong. Please try again.'
export default api
