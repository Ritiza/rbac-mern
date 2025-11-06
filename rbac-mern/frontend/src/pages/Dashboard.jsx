import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard(){
  const [posts,setPosts] = useState([]);
  const { user } = useAuth();
  useEffect(()=>{ axios.get('/api/posts').then(r=>setPosts(r.data)).catch(()=>{}); },[]);
  return <div>
    <h2>Posts</h2>
    {user && (user.role === 'admin' || user.role === 'editor') && <CreateBox onCreated={p=>setPosts([p,...posts])} />}
    <ul>
      {posts.map(p=> <li key={p._id}>
        <h3>{p.title}</h3>
        <p>{p.body}</p>
        <small>by {p.authorId?.name || 'unknown'}</small>
        {user && (user.role==='admin' || (user.role==='editor' && p.authorId && p.authorId._id===user.id)) && <button>Edit</button>}
      </li>)}
    </ul>
  </div>;
}

function CreateBox({onCreated}){
  const [t,st] = React.useState('');
  const [b,sb] = React.useState('');
  const create = async ()=>{ const r = await axios.post('/api/posts', { title:t, body:b }); onCreated(r.data); st(''); sb(''); };
  return <div>
    <h4>Create</h4>
    <input value={t} onChange={e=>st(e.target.value)} placeholder="title" />
    <textarea value={b} onChange={e=>sb(e.target.value)} placeholder="body" />
    <button onClick={create}>Create</button>
  </div>;
}
