require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const RefreshToken = require('../models/RefreshToken');
const AuditLog = require('../models/AuditLog');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rbac_db';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await RefreshToken.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const admin = new User({
      name: 'Alice Admin',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: 'admin',
      isActive: true
    });

    const editor1 = new User({
      name: 'Eddie Editor',
      email: 'editor@example.com',
      password: 'Editor123!',
      role: 'editor',
      isActive: true
    });

    const editor2 = new User({
      name: 'Emma Editor',
      email: 'editor2@example.com',
      password: 'Editor123!',
      role: 'editor',
      isActive: true
    });

    const viewer1 = new User({
      name: 'Vera Viewer',
      email: 'viewer@example.com',
      password: 'Viewer123!',
      role: 'viewer',
      isActive: true
    });

    const viewer2 = new User({
      name: 'Victor Viewer',
      email: 'viewer2@example.com',
      password: 'Viewer123!',
      role: 'viewer',
      isActive: true
    });

    await admin.save();
    await editor1.save();
    await editor2.save();
    await viewer1.save();
    await viewer2.save();

    console.log('✅ Created users:');
    console.log('   Admin: admin@example.com / Admin123!');
    console.log('   Editor 1: editor@example.com / Editor123!');
    console.log('   Editor 2: editor2@example.com / Editor123!');
    console.log('   Viewer 1: viewer@example.com / Viewer123!');
    console.log('   Viewer 2: viewer2@example.com / Viewer123!');

    // Create sample posts
    const posts = [
      {
        title: 'Welcome to RBAC System',
        body: 'This is a sample post created by the admin. Admins can manage all posts regardless of ownership.',
        authorId: admin._id,
        status: 'published',
        tags: ['welcome', 'admin']
      },
      {
        title: 'Editor Post 1',
        body: 'This post was created by Eddie Editor. Editors can only modify their own posts.',
        authorId: editor1._id,
        status: 'published',
        tags: ['editor', 'sample']
      },
      {
        title: 'Editor Post 2',
        body: 'Another post by Eddie Editor demonstrating ownership.',
        authorId: editor1._id,
        status: 'published',
        tags: ['editor']
      },
      {
        title: 'Emma\'s First Post',
        body: 'This post belongs to Emma Editor. She can edit and delete this, but not Eddie\'s posts.',
        authorId: editor2._id,
        status: 'published',
        tags: ['editor', 'ownership']
      },
      {
        title: 'Draft Post',
        body: 'This is a draft post that only the author and admins can see.',
        authorId: editor1._id,
        status: 'draft',
        tags: ['draft']
      },
      {
        title: 'Archived Post',
        body: 'This post has been archived.',
        authorId: admin._id,
        status: 'archived',
        tags: ['archived']
      }
    ];

    for (const postData of posts) {
      const post = new Post(postData);
      await post.save();
    }

    console.log('✅ Created sample posts');

    // Create some audit log entries
    const auditEntries = [
      {
        correlationId: require('uuid').v4(),
        userId: admin._id,
        action: 'user:create',
        resource: 'user',
        resourceId: editor1._id,
        method: 'POST',
        path: '/api/auth/register',
        statusCode: 201,
        metadata: { role: 'editor' }
      },
      {
        correlationId: require('uuid').v4(),
        userId: editor1._id,
        action: 'post:create',
        resource: 'post',
        method: 'POST',
        path: '/api/posts',
        statusCode: 201,
        metadata: { title: 'Editor Post 1' }
      }
    ];

    for (const entry of auditEntries) {
      const log = new AuditLog(entry);
      await log.save();
    }

    console.log('✅ Created sample audit logs');
    console.log('\n🎉 Seeding completed successfully!');
    console.log('\nYou can now start the server and test the application.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
