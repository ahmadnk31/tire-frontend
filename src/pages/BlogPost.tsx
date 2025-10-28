import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, User, Tag, ArrowLeft, Eye, MessageCircle, Send, Share2, Copy } from 'lucide-react';
 
import { blogApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface Comment {
  id: number;
  content: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
}

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // In-memory cache for viewed posts (fallback when storage is not available)
  const [viewedPostsCache] = useState<Set<string>>(new Set());
  
  const [commentForm, setCommentForm] = useState({
    authorName: '',
    authorEmail: '',
    content: ''
  });

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('token');
  const currentUser = isLoggedIn ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  // Fetch blog post
  const { data: postData, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => blogApi.getBySlug(slug!),
    enabled: !!slug,
  });

  // Helper function to safely access storage
  const getViewedPosts = (storage: Storage) => {
    try {
      return JSON.parse(storage.getItem('viewedPosts') || '{}');
    } catch (error) {
      console.warn('Failed to parse viewed posts from storage:', error);
      return {};
    }
  };

  const setViewedPosts = (storage: Storage, viewedPosts: Record<string, boolean>) => {
    try {
      storage.setItem('viewedPosts', JSON.stringify(viewedPosts));
    } catch (error) {
      console.warn('Failed to save viewed posts to storage:', error);
    }
  };

  // Increment view count (only once per visit)
  const incrementViewMutation = useMutation({
    mutationFn: () => blogApi.incrementView(slug!),
    onSuccess: () => {
      // Mark this post as viewed in both localStorage and sessionStorage
      const viewedPosts = getViewedPosts(localStorage);
      const sessionViewedPosts = getViewedPosts(sessionStorage);
      
      viewedPosts[slug!] = true;
      sessionViewedPosts[slug!] = true;
      
      setViewedPosts(localStorage, viewedPosts);
      setViewedPosts(sessionStorage, sessionViewedPosts);
      
      // Also add to in-memory cache
      viewedPostsCache.add(slug!);
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (data: { content: string; authorName: string; authorEmail: string }) =>
      blogApi.addComment(postData?.post?.id!, data),
    onSuccess: () => {
      toast({
        title: "Comment submitted",
        description: "Your comment has been submitted and is awaiting approval.",
      });
      setCommentForm({ authorName: '', authorEmail: '', content: '' });
      // Refetch the post to get updated comments
      queryClient.invalidateQueries({ queryKey: ['blog-post', slug] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Increment view count on first visit
  useEffect(() => {
    if (slug && postData?.post) {
      // Check localStorage, sessionStorage, and in-memory cache
      const viewedPosts = getViewedPosts(localStorage);
      const sessionViewedPosts = getViewedPosts(sessionStorage);
      const isInMemoryCache = viewedPostsCache.has(slug);
      
      console.log('🔍 View tracking check:', {
        slug,
        inLocalStorage: !!viewedPosts[slug],
        inSessionStorage: !!sessionViewedPosts[slug],
        inMemoryCache: isInMemoryCache,
        willIncrement: !viewedPosts[slug] && !sessionViewedPosts[slug] && !isInMemoryCache
      });
      
      // Only increment if not viewed in any storage
      if (!viewedPosts[slug] && !sessionViewedPosts[slug] && !isInMemoryCache) {
        console.log('📈 Incrementing view count for:', slug);
        incrementViewMutation.mutate();
      } else {
        console.log('✅ View already counted for:', slug);
      }
    }
  }, [slug, postData?.post, viewedPostsCache]);

  // Auto-fill comment form for logged-in users
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      setCommentForm(prev => ({
        ...prev,
        authorName: currentUser.name || '',
        authorEmail: currentUser.email || ''
      }));
    }
  }, [isLoggedIn, currentUser]);

  const post = postData?.post;
  const comments = post?.comments || [];
 // Social share logic
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = post ? encodeURIComponent(post.title) : '';
  const encodedUrl = encodeURIComponent(shareUrl);
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Link copied!', description: 'You can now share this link.' });
  };
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentForm.content) {
      toast({
        title: "Missing comment",
        description: "Please enter your comment.",
        variant: "destructive",
      });
      return;
    }

    // For logged-in users, use their info; for guests, require name and email
    if (!isLoggedIn && (!commentForm.authorName || !commentForm.authorEmail)) {
      toast({
        title: "Missing fields",
        description: "Please fill in your name and email.",
        variant: "destructive",
      });
      return;
    }

    addCommentMutation.mutate(commentForm);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Blog post not found
            </h3>
            <p className="text-gray-600 mb-4">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/blog')}>
              Back to Blog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/blog')}
          className="mb-8 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Button>

  {/* Article Header */}
  <article className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Featured Image */}
          {post.image && (
            <div className="relative h-64 md:h-96">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">
                  {post.category}
                </span>
              </div>
            </div>
          )}

          {/* Social Share Buttons */}
          <div className="flex flex-wrap gap-3 items-center p-4 border-b border-gray-100 mb-4">
            <span className="font-semibold text-gray-700 flex items-center gap-1"><Share2 className="h-4 w-4" /> Share:</span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >Facebook</a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-500 text-sm"
            >Twitter</a>
            <a
              href={`https://wa.me/?text=${shareText}%20${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >WhatsApp</a>
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm flex items-center gap-1"
            >
              <Copy className="h-4 w-4" /> Copy Link
            </button>
          </div>
          {/* Embed instructions */}
          <div className="p-4 border-b border-gray-100 mb-4 bg-gray-50 rounded">
            <span className="font-semibold text-gray-700">Embed this blog post:</span>
            <pre className="bg-gray-100 rounded p-2 mt-2 text-xs overflow-x-auto"><code>{`<iframe src="${window.location.origin}/blog/embed/${slug}" width="100%" height="600" frameborder="0" style="border:0;overflow:auto;"></iframe>`}</code></pre>
            <span className="text-xs text-gray-500">Copy and paste this HTML into any website to embed this post.</span>
          </div>
          <div className="p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-6">
              {post.excerpt}
            </p>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.views} views
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <RichTextEditor
                value={post.content}
                onChange={() => {}} // Read-only
                readOnly
                className="border-none shadow-none"
              />
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900">
              Comments ({comments.length})
            </h2>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Leave a Comment
            </h3>
            
            {/* Show name/email fields only for guests */}
            {!isLoggedIn && (
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <Input
                    value={commentForm.authorName}
                    onChange={(e) => setCommentForm(prev => ({ ...prev, authorName: e.target.value }))}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={commentForm.authorEmail}
                    onChange={(e) => setCommentForm(prev => ({ ...prev, authorEmail: e.target.value }))}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>
            )}
            
            {/* Show user info for logged-in users */}
            {isLoggedIn && currentUser && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Commenting as: <strong>{currentUser.name}</strong> ({currentUser.email})
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment *
              </label>
              <Textarea
                value={commentForm.content}
                onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Share your thoughts..."
                rows={4}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={addCommentMutation.isPending}
              className="mt-4 flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {addCommentMutation.isPending ? 'Submitting...' : 'Submit Comment'}
            </Button>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.authorName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
