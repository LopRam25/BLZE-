import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from './Navigation';

const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blog`);
      if (response.ok) {
        const data = await response.json();
        setBlogPosts(data);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">BLZE Blog</h1>
          <p className="text-xl text-gray-300">
            Stay updated with the latest cannabis news, education, and insights
          </p>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="container mx-auto px-4 py-16">
        {blogPosts.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">No blog posts yet</h2>
            <p className="text-gray-500">Check back soon for cannabis education and updates!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {post.image && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 text-gray-900 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  {post.publishDate && (
                    <p className="text-sm text-gray-500 mb-3">
                      {formatDate(post.publishDate)}
                    </p>
                  )}
                  <div className="text-gray-700 mb-4">
                    {post.content.length > 150 
                      ? `${post.content.substring(0, 150)}...` 
                      : post.content
                    }
                  </div>
                  <button className="text-blue-500 hover:text-blue-700 font-semibold transition-colors">
                    Read More →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter Signup */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Stay Updated</h3>
          <p className="text-xl mb-8">Get the latest cannabis news and education delivered to your inbox</p>
          <div className="max-w-md mx-auto flex">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-500 text-white px-6 py-3 rounded-r-lg hover:bg-blue-600 transition-colors font-semibold">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPost();
  }, [id]);

  const fetchBlogPost = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blog/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Post not found</h2>
        <a href="/blog" className="text-blue-500 hover:text-blue-700">← Back to Blog</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {post.image && (
              <div className="h-64 md:h-96 bg-gray-200 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                {post.title}
              </h1>
              {post.publishDate && (
                <p className="text-sm text-gray-500 mb-8">
                  Published on {formatDate(post.publishDate)}
                </p>
              )}
              <div className="prose prose-lg max-w-none text-gray-700">
                {post.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-6 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </article>
          
          <div className="mt-8 text-center">
            <a 
              href="/blog"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              ← Back to Blog
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
export { BlogPost };