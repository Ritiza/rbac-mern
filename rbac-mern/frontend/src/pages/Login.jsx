import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login(){
  const [email,setEmail] = useState('');
  const [pw,setPw] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();
  const submit = async (e)=>{ e.preventDefault(); await login(email,pw); nav('/'); };
  return <form onSubmit={submit}>
    <h2>Login</h2>
    <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
    <input placeholder="password" value={pw} type="password" onChange={e=>setPw(e.target.value)} />
    <button>Login</button>
  </form>
}
