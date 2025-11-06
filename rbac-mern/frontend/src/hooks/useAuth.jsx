import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
const API = process.env.REACT_APP_API || 'http://localhost:4000';

const AuthContext = createContext();
export function AuthProvider({children}){
  const [user,setUser] = useState(null);
  const login = async (email,password)=>{
    const res = await axios.post(API + '/api/auth/login',{ email, password });
    setUser(res.data.user);
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.accessToken;
    return res.data.user;
  };
  const logout = ()=>{ setUser(null); delete axios.defaults.headers.common['Authorization']; };
  return <AuthContext.Provider value={{user,login,logout}}>{children}</AuthContext.Provider>
}
export const useAuth = ()=> useContext(AuthContext);
export default useAuth;
