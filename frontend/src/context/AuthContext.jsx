import {createContext,useContext,useMemo,useState} from 'react'
import api from '../services/api'
const AuthContext=createContext(null)
export function AuthProvider({children}){const [user,setUser]=useState(()=>{try{return JSON.parse(sessionStorage.getItem('sms_user'))}catch{return null}});const login=async(email,password)=>{const {data}=await api.post('/auth/login',{email,password});sessionStorage.setItem('sms_token',data.token);sessionStorage.setItem('sms_user',JSON.stringify(data));setUser(data);return data};const logout=async()=>{try{await api.post('/auth/logout')}finally{sessionStorage.clear();setUser(null)}};return <AuthContext.Provider value={useMemo(()=>({user,login,logout}),[user])}>{children}</AuthContext.Provider>}
export const useAuth=()=>useContext(AuthContext)
