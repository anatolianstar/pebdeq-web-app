import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    per_page: 10,
    total: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [newPost, setNewPost] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: '',
    category: '',
    featured_image: '',
    is_published: false
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, [pagination.page]);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/blog?page=${page}&per_page=10`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        setPagination(data.pagination);
      } else {
        toast.error('Failed to load blog posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Error fetching posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newPost)
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Blog post created successfully');
        setShowModal(false);
        setNewPost({
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          author: '',
          category: '',
          featured_image: '',
          is_published: false
        });
        fetchPosts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create blog post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Error creating post');
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/admin/blog/${editingPost.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editingPost)
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Blog post updated successfully');
        setShowModal(false);
        setEditingPost(null);
        fetchPosts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update blog post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Error updating post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        toast.success('Blog post deleted successfully');
        fetchPosts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete blog post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error deleting post');
    }
  };

  const handleTogglePublish = async (postId) => {
    try {
      const response = await fetch(`/api/admin/blog/${postId}/toggle-publish`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchPosts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to toggle publish status');
      }
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast.error('Error toggling publish status');
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPost(null);
    setNewPost({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: '',
      category: '',
      featured_image: '',
      is_published: false
    });
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.url;
        
        if (editingPost) {
          setEditingPost(prev => ({
            ...prev,
            featured_image: imageUrl
          }));
        } else {
          setNewPost(prev => ({
            ...prev,
            featured_image: imageUrl
          }));
        }
        
        toast.success('Image uploaded successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) {
      toast.error('Please select posts to delete');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedPosts.length} blog post(s)?`)) {
      return;
    }
    
    try {
      const deletePromises = selectedPosts.map(postId => 
        fetch(`/api/admin/blog/${postId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })
      );
      
      await Promise.all(deletePromises);
      toast.success(`${selectedPosts.length} blog post(s) deleted successfully`);
      setSelectedPosts([]);
      fetchPosts();
    } catch (error) {
      console.error('Error bulk deleting posts:', error);
      toast.error('Error deleting posts');
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading blog posts...</p>
      </div>
    );
  }

  return (
    <div className="blog-management">
      <div className="blog-management-header">
        <h2>Blog Management</h2>
        <div className="blog-actions">
          {selectedPosts.length > 0 && (
            <button 
              className="btn btn-danger btn-sm"
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedPosts.length})
            </button>
          )}
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Add New Post
          </button>
        </div>
      </div>

      <div className="blog-table-container">
        <table className="blog-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedPosts.length === posts.length && posts.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPosts(posts.map(p => p.id));
                    } else {
                      setSelectedPosts([]);
                    }
                  }}
                />
              </th>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedPosts.includes(post.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPosts(prev => [...prev, post.id]);
                      } else {
                        setSelectedPosts(prev => prev.filter(id => id !== post.id));
                      }
                    }}
                  />
                </td>
                <td>
                  <div className="post-title">
                    <strong>{post.title}</strong>
                    {post.excerpt && <p className="post-excerpt">{post.excerpt.substring(0, 100)}...</p>}
                  </div>
                </td>
                <td>{post.author}</td>
                <td>{post.category || 'Uncategorized'}</td>
                <td>
                  <span className={`status-badge ${post.is_published ? 'published' : 'draft'}`}>
                    {post.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td>{formatDate(post.created_at)}</td>
                <td>
                  <div className="post-actions">
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEditPost(post)}
                    >
                      Edit
                    </button>
                    <button 
                      className={`btn btn-sm ${post.is_published ? 'btn-outline-warning' : 'btn-outline-success'}`}
                      onClick={() => handleTogglePublish(post.id)}
                    >
                      {post.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {posts.length === 0 && (
          <div className="empty-state">
            <h3>No blog posts found</h3>
            <p>Start by creating your first blog post!</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              Create First Post
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-outline-primary"
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </button>
          
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <button 
              key={page}
              className={`btn ${page === pagination.page ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          
          <button 
            className="btn btn-outline-primary"
            disabled={pagination.page === pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Blog Post Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h3>{editingPost ? 'Edit Blog Post' : 'Add New Blog Post'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={editingPost ? handleUpdatePost : handleCreatePost}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={editingPost ? editingPost.title : newPost.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = generateSlug(title);
                      if (editingPost) {
                        setEditingPost(prev => ({
                          ...prev,
                          title,
                          slug
                        }));
                      } else {
                        setNewPost(prev => ({
                          ...prev,
                          title,
                          slug
                        }));
                      }
                    }}
                    required
                    placeholder="Enter blog post title"
                  />
                </div>

                <div className="form-group">
                  <label>Slug</label>
                  <input
                    type="text"
                    value={editingPost ? editingPost.slug : newPost.slug}
                    onChange={(e) => {
                      if (editingPost) {
                        setEditingPost(prev => ({
                          ...prev,
                          slug: e.target.value
                        }));
                      } else {
                        setNewPost(prev => ({
                          ...prev,
                          slug: e.target.value
                        }));
                      }
                    }}
                    placeholder="auto-generated-from-title"
                  />
                  <small>URL-friendly version of the title</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Author</label>
                    <input
                      type="text"
                      value={editingPost ? editingPost.author : newPost.author}
                      onChange={(e) => {
                        if (editingPost) {
                          setEditingPost(prev => ({
                            ...prev,
                            author: e.target.value
                          }));
                        } else {
                          setNewPost(prev => ({
                            ...prev,
                            author: e.target.value
                          }));
                        }
                      }}
                      placeholder="Author name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      value={editingPost ? editingPost.category : newPost.category}
                      onChange={(e) => {
                        if (editingPost) {
                          setEditingPost(prev => ({
                            ...prev,
                            category: e.target.value
                          }));
                        } else {
                          setNewPost(prev => ({
                            ...prev,
                            category: e.target.value
                          }));
                        }
                      }}
                      placeholder="Blog category"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Excerpt</label>
                  <textarea
                    value={editingPost ? editingPost.excerpt : newPost.excerpt}
                    onChange={(e) => {
                      if (editingPost) {
                        setEditingPost(prev => ({
                          ...prev,
                          excerpt: e.target.value
                        }));
                      } else {
                        setNewPost(prev => ({
                          ...prev,
                          excerpt: e.target.value
                        }));
                      }
                    }}
                    rows="3"
                    placeholder="Brief description of the blog post..."
                  />
                </div>

                <div className="form-group">
                  <label>Content *</label>
                  <textarea
                    value={editingPost ? editingPost.content : newPost.content}
                    onChange={(e) => {
                      if (editingPost) {
                        setEditingPost(prev => ({
                          ...prev,
                          content: e.target.value
                        }));
                      } else {
                        setNewPost(prev => ({
                          ...prev,
                          content: e.target.value
                        }));
                      }
                    }}
                    rows="10"
                    required
                    placeholder="Write your blog post content here..."
                  />
                </div>

                <div className="form-group">
                  <label>Featured Image</label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0])}
                      disabled={uploadingImage}
                    />
                    {uploadingImage && <span className="uploading">Uploading...</span>}
                    {((editingPost && editingPost.featured_image) || (!editingPost && newPost.featured_image)) && (
                      <div className="image-preview">
                        <img 
                          src={editingPost ? editingPost.featured_image : newPost.featured_image} 
                          alt="Featured" 
                          style={{ maxWidth: '200px', maxHeight: '150px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={editingPost ? editingPost.is_published : newPost.is_published}
                      onChange={(e) => {
                        if (editingPost) {
                          setEditingPost(prev => ({
                            ...prev,
                            is_published: e.target.checked
                          }));
                        } else {
                          setNewPost(prev => ({
                            ...prev,
                            is_published: e.target.checked
                          }));
                        }
                      }}
                    />
                    Publish immediately
                  </label>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement; 