require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/rbac_db';

async function seed(){
  await mongoose.connect(MONGO);
  await User.deleteMany({});
  await Post.deleteMany({});
  const admin = new User({ name:'Alice Admin', email:'admin@example.com', password:'password', role:'admin' });
  const editor = new User({ name:'Eddie Editor', email:'editor@example.com', password:'password', role:'editor' });
  const viewer = new User({ name:'Vera Viewer', email:'viewer@example.com', password:'password', role:'viewer' });
  await admin.save(); await editor.save(); await viewer.save();
  const p1 = new Post({ title:'Editor post', body:'Owned by editor', authorId: editor._id });
  const p2 = new Post({ title:'Admin post', body:'Owned by admin', authorId: admin._id });
  await p1.save(); await p2.save();
  console.log('Seeded users: admin/editor/viewer with password "password"');
  process.exit(0);
}
seed().catch(e=>{console.error(e); process.exit(1);});
