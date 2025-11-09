import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, User, Tag, Search, ChevronRight, TrendingUp, Eye } from 'lucide-react';
import { blogApi } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  featured: boolean;
  views: number;
}

interface Category {
  name: string;
  count: number;
}

const Blog: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Fetch blog posts
  const { data: blogData, isLoading, error } = useQuery({
    queryKey: ['blog-posts', currentPage, selectedCategory, searchTerm],
    queryFn: () => {
      console.log('🔄 Blog page: React Query fetching with params:', {
        page: currentPage,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchTerm || undefined,
      });
      return blogApi.getAll({
        page: currentPage,
        limit: 9,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchTerm || undefined,
      });
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  console.log('📄 Blog page: React Query state:', {
    isLoading,
    error,
    blogData,
    postsCount: blogData?.posts?.length || 0
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => blogApi.getCategories(),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 10 * 60 * 1000, // 10 minutes - categories change less frequently
  });

  // Fetch featured posts
  const { data: featuredData } = useQuery({
    queryKey: ['blog-featured'],
    queryFn: () => blogApi.getFeatured(),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const blogPosts: BlogPost[] = blogData?.posts || [];
  const categories: Category[] = categoriesData?.categories || [];
  const featuredPost = featuredData?.posts?.[0];
  const pagination = blogData?.pagination;
  const totalPosts = blogData?.pagination?.total || blogPosts.length;

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleNewsletterSubscribe = async () => {
    if (!newsletterEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    try {
      await blogApi.subscribe({ email: newsletterEmail });
      toast({
        title: "Subscribed successfully",
        description: "You've been subscribed to our newsletter",
      });
      setNewsletterEmail('');
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleReadMore = (post: BlogPost) => {
    navigate(`/blog/${post.slug}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error loading blog posts
            </h3>
            <p className="text-gray-600">
              Please try again later
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            {t('blog.title')}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            {t('blog.description')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col lg:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder={t('blog.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              All ({totalPosts})
            </button>
            {categories.map(category => (
              <button
                key={category.name}
                onClick={() => handleCategoryChange(category.name)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  selectedCategory === category.name
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && selectedCategory === 'all' && !searchTerm && currentPage === 1 && (
          <div className="mb-6 sm:mb-8 lg:mb-12">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-primary">{t('blog.featured')}</span>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-48 sm:h-64 lg:h-full">
                  <img
                    src={featuredPost.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop'}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                    <span className="px-2 py-1 sm:px-3 bg-primary text-white text-xs sm:text-sm font-medium rounded-full">
                      {featuredPost.category}
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-6 lg:p-8">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-5 lg:mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-5 lg:mb-6">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      {new Date(featuredPost.publishedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      {featuredPost.readTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      {featuredPost.views}
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleReadMore(featuredPost)}
                    variant='outline'
                    className="flex items-center gap-2 text-white font-medium hover:text-primary/80 transition-colors"
                  >
                    {t('blog.readMore')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-md animate-pulse">
                <div className="h-40 sm:h-48 bg-gray-200"></div>
                <div className="p-4 sm:p-6">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2 sm:mb-3"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2 sm:mb-3 w-3/4"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 rounded mb-3 sm:mb-4"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blog Posts Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {blogPosts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No blog posts yet
                </h3>
                <p className="text-gray-600 mb-6">
                  We're working on creating great content for you. Check back soon!
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setCurrentPage(1);
                    }}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              blogPosts.map(post => (
                <article key={post.id} className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col h-full">
                  <div className="relative">
                    <img
                      src={post.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop'}
                      alt={post.title}
                      className="w-full h-auto object-cover aspect-square"
                    />
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                      <span className="px-2 py-1 sm:px-3 bg-primary text-white text-xs sm:text-sm font-medium rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 lg:p-6 flex flex-col flex-1">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        {post.readTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        {post.views}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto">
                      <Button 
                        onClick={() => handleReadMore(post)}
                        variant='outline'
                        className="flex items-center gap-2 font-medium transition-colors"
                      >
                        {t('blog.readMore')}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-16 bg-primary/5 rounded-xl p-4 sm:p-8 border border-primary/20">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t('blog.newsletter.title')}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
              {t('blog.newsletter.description')}
            </p>
            <div className="flex flex-col sm:flex-row w-full max-w-md mx-auto gap-2 sm:gap-0">
              <input
                type="email"
                placeholder={t('blog.newsletter.placeholder')}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button 
                onClick={handleNewsletterSubscribe}
                className="px-4 sm:px-6 py-2 bg-primary text-sm sm:text-base text-white rounded-lg sm:rounded-l-none sm:rounded-r-lg hover:bg-primary/90 transition-colors"
              >
                {t('blog.newsletter.subscribe')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
