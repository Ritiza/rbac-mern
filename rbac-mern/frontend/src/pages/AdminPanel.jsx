import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export default function AdminPanel(){
  const { user } = useAuth();
  const [users,setUsers] = useState([]);
  useEffect(()=>{ if(!user) return; axios.get('/api/admin/users').then(r=>setUsers(r.data)).catch(()=>{}); },[user]);
  if(!user || user.role !== 'admin') return <div>Access denied</div>;
  return <div>
    <h2>Admin</h2>
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
      <tbody>
        {users.map(u=> <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
        <td>
          <select defaultValue={u.role} onChange={e=>axios.put('/api/admin/users/'+u._id+'/role',{ role: e.target.value }).then(r=>setUsers(users.map(x=>x._id===u._id?r.data:x))).catch(()=>{})}>
            <option value="admin">admin</option>
            <option value="editor">editor</option>
            <option value="viewer">viewer</option>
          </select>
        </td></tr>)}
      </tbody>
    </table>
  </div>
}
