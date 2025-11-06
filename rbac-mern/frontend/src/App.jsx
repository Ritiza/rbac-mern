import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import { AuthProvider, useAuth } from './hooks/useAuth';

function Nav(){
  const { user, logout } = useAuth();
  return (<nav>
    <Link to="/">Home</Link> | {user ? <>
      <span>{user.email} ({user.role})</span>
      <button onClick={logout}>Logout</button>
      <Link to="/admin">Admin</Link>
    </> : <Link to="/login">Login</Link>}
  </nav>);
}

export default function App(){
  return <AuthProvider>
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/" element={<Dashboard/>} />
        <Route path="/admin" element={<AdminPanel/>} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
}
