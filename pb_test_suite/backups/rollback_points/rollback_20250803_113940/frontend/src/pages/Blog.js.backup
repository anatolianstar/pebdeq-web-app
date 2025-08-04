import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ShareButtons from '../components/ShareButtons';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    per_page: 10,
    total: 0
  });

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async (page = 1) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/blog?page=${page}&per_page=10`);
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
        setPagination(data.pagination || {});
      } else {
        console.error('Failed to fetch blog posts');
        toast.error('Failed to load blog posts');
      }
      
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchBlogPosts(page);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="blog fade-in">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog fade-in">
      <div className="container">
        <div className="blog-header">
          <h1>Blog</h1>
          <p>Read our latest articles and updates</p>
        </div>
        
        <div className="blog-posts">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="blog-post-card">
                {post.featured_image && (
                  <div className="blog-post-image">
                    <img 
                      src={post.featured_image.startsWith('http') 
                        ? post.featured_image 
                        : `http://localhost:5005${post.featured_image}`
                      } 
                      alt={post.title || 'Blog post image'}
                    />
                  </div>
                )}
                <div className="blog-post-content">
                  <div className="blog-post-meta">
                    <span className="blog-date">{formatDate(post.created_at)}</span>
                    <span className="blog-author">By {post.author || 'Admin'}</span>
                    {post.category && (
                      <span className="blog-category">{post.category}</span>
                    )}
                  </div>
                  <h3>
                    <Link to={`/blog/${post.slug}`}>
                      {post.title || 'Untitled Post'}
                    </Link>
                  </h3>
                  <p>{post.excerpt || (post.content && post.content.substring(0, 150) + '...') || 'No description available.'}</p>
                  <Link to={`/blog/${post.slug}`} className="blog-read-more">
                    Read More →
                  </Link>
                  
                  <ShareButtons
                    url={`${window.location.origin}/blog/${post.slug}`}
                    title={post.title || 'Untitled Post'}
                    description={post.excerpt || (post.content && post.content.substring(0, 150) + '...') || 'Read this interesting blog post'}
                    image={post.featured_image}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h3>No blog posts yet</h3>
              <p>Check back later for interesting articles and updates!</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="blog-pagination">
            <button 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn btn-outline"
            >
              Previous
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`btn ${page === pagination.page ? 'btn-primary' : 'btn-outline'}`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="btn btn-outline"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .blog {
          padding: 2rem 0;
          min-height: 70vh;
          background: #f8f9fa;
        }

        .blog-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .blog-header h1 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .blog-header p {
          color: #6c757d;
          font-size: 1.1rem;
        }

        .loading-spinner {
          text-align: center;
          padding: 4rem;
        }

        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .blog-posts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .blog-post-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .blog-post-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .blog-post-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        .blog-post-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .blog-post-card:hover .blog-post-image img {
          transform: scale(1.05);
        }

        .blog-post-content {
          padding: 1.5rem;
        }

        .blog-post-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: #6c757d;
        }

        .blog-date, .blog-author, .blog-category {
          background: #f8f9fa;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .blog-category {
          background: #e3f2fd;
          color: #1976d2;
        }

        .blog-post-content h3 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
        }

        .blog-post-content h3 a {
          color: inherit;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .blog-post-content h3 a:hover {
          color: #007bff;
        }

        .blog-post-content p {
          color: #6c757d;
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .blog-read-more {
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.2s ease;
        }

        .blog-read-more:hover {
          color: #0056b3;
          text-decoration: none;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          grid-column: 1 / -1;
        }

        .empty-state h3 {
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .empty-state p {
          color: #6c757d;
        }

        .blog-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 3rem;
        }

        .page-numbers {
          display: flex;
          gap: 0.5rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }

        .btn-outline {
          background: transparent;
          color: #007bff;
          border: 2px solid #007bff;
        }

        .btn-outline:hover:not(:disabled) {
          background: #007bff;
          color: white;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .blog-posts {
            grid-template-columns: 1fr;
          }

          .blog-post-meta {
            flex-direction: column;
            gap: 0.5rem;
          }

          .blog-pagination {
            flex-direction: column;
            gap: 1rem;
          }

          .page-numbers {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Blog; 