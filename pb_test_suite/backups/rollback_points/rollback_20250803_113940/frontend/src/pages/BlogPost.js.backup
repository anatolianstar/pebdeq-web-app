import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ShareButtons from '../components/ShareButtons';
import LikeButton from '../components/LikeButton';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchBlogPost();
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/blog/${slug}`);
      
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else if (response.status === 404) {
        setError('Blog post not found');
      } else {
        setError('Failed to load blog post');
      }
      
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setError('Failed to load blog post');
      toast.error('Failed to load blog post');
    } finally {
      setLoading(false);
    }
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
      <div className="blog-post fade-in">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading blog post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-post fade-in">
        <div className="container">
          <div className="error-state">
            <h2>Error</h2>
            <p>{error}</p>
            <Link to="/blog" className="btn btn-primary">
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blog-post fade-in">
        <div className="container">
          <div className="error-state">
            <h2>Blog Post Not Found</h2>
            <p>The requested blog post could not be found.</p>
            <Link to="/blog" className="btn btn-primary">
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post fade-in">
      <div className="container">
        <div className="blog-post-header">
          <Link to="/blog" className="back-link">
            ← Back to Blog
          </Link>
          
          {post.featured_image && (
            <div className="blog-post-featured-image">
              <img 
                src={post.featured_image.startsWith('http') 
                  ? post.featured_image 
                  : `http://localhost:5005${post.featured_image}`
                } 
                alt={post.title}
              />
            </div>
          )}
          
          <div className="blog-post-meta">
            <h1>{post.title}</h1>
            <div className="blog-meta">
              <span className="blog-date">{formatDate(post.created_at)}</span>
              <span className="blog-author">By {post.author}</span>
              {post.category && (
                <span className="blog-category">{post.category}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="blog-post-content">
          <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          <ShareButtons
            url={window.location.href}
            title={post.title}
            description={post.excerpt || post.content.substring(0, 150) + '...'}
            image={post.featured_image}
          />
          
          <div className="blog-actions">
            <LikeButton type="blog" itemId={post.id} />
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .blog-post {
          padding: 2rem 0;
          min-height: 70vh;
          background: #f8f9fa;
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

        .error-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .error-state h2 {
          color: #dc3545;
          margin-bottom: 1rem;
        }

        .error-state p {
          color: #6c757d;
          margin-bottom: 2rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
          margin-bottom: 2rem;
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: #0056b3;
          text-decoration: none;
        }

        .blog-post-header {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .blog-post-featured-image {
          width: 100%;
          height: 400px;
          overflow: hidden;
        }

        .blog-post-featured-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .blog-post-meta {
          padding: 2rem;
        }

        .blog-post-meta h1 {
          color: #2c3e50;
          margin-bottom: 1rem;
          font-size: 2.5rem;
          line-height: 1.2;
        }

        .blog-meta {
          display: flex;
          gap: 1rem;
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

        .blog-post-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 2rem;
        }

        .blog-content {
          line-height: 1.8;
          color: #2c3e50;
          margin-bottom: 2rem;
        }

        .blog-content h2 {
          color: #2c3e50;
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-size: 1.8rem;
        }

        .blog-content h3 {
          color: #2c3e50;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-size: 1.4rem;
        }

        .blog-content p {
          margin-bottom: 1rem;
          color: #5a6c7d;
        }

        .blog-content ul, .blog-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .blog-content li {
          margin-bottom: 0.5rem;
          color: #5a6c7d;
        }

        .blog-content blockquote {
          border-left: 4px solid #007bff;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6c757d;
        }

        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .blog-actions {
          display: flex;
          gap: 1rem;
          padding-top: 2rem;
          border-top: 1px solid #e9ecef;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .blog-post-meta h1 {
            font-size: 2rem;
          }

          .blog-meta {
            flex-direction: column;
            gap: 0.5rem;
          }

          .blog-post-featured-image {
            height: 250px;
          }

          .blog-post-content {
            padding: 1.5rem;
          }

          .blog-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default BlogPost; 