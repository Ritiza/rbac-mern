import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';

const API = process.env.REACT_APP_API || 'http://localhost:4000';

function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, hasPermission } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/posts`);
      setPosts(response.data.posts || response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await axios.delete(`${API}/api/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              {hasPermission('posts:create') && (
                <Link
                  to="/posts/new"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  + New Post
                </Link>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading posts...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">No posts found.</p>
                {hasPermission('posts:create') && (
                  <Link
                    to="/posts/new"
                    className="mt-4 inline-block text-blue-600 hover:text-blue-700"
                  >
                    Create your first post
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    user={user}
                    hasPermission={hasPermission}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function PostCard({ post, user, hasPermission, onDelete }) {
  const canEdit = hasPermission('posts:update') && 
    (user.role === 'admin' || post.authorId?._id === user.id || post.authorId === user.id);
  const canDelete = hasPermission('posts:delete') && 
    (user.role === 'admin' || post.authorId?._id === user.id || post.authorId === user.id);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
        <span className={`px-2 py-1 text-xs font-semibold rounded ${
          post.status === 'published' ? 'bg-green-100 text-green-800' :
          post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {post.status}
        </span>
      </div>
      <p className="text-gray-600 mb-4 line-clamp-3">{post.body}</p>
      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
        <span>By {post.authorId?.name || 'Unknown'}</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
      {(canEdit || canDelete) && (
        <div className="flex gap-2 pt-4 border-t">
          {canEdit && (
            <Link
              to={`/posts/${post._id}/edit`}
              className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Edit
            </Link>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(post._id)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>
      )}
      {!canEdit && !canDelete && user.role === 'viewer' && (
        <div className="pt-4 border-t text-xs text-gray-500">
          Read-only access
        </div>
      )}
    </div>
  );
}

export default Dashboard;
