import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Calendar, User, Tag, Search, Filter } from 'lucide-react';
import { AddBlogPost } from './AddBlogPost';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  featured: boolean;
  readTime: string;
  image: string;
  views: number;
  publishedAt: string;
  createdAt: string;
  tags: string[];
}

export const BlogManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch blog posts
  const { data: postsData, isLoading, refetch } = useQuery({
    queryKey: ['admin-blog-posts', currentPage, statusFilter, searchTerm],
    queryFn: () => {
      console.log('🔄 BlogManagement: React Query fetching with params:', {
        page: currentPage,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm
      });
      return blogApi.admin.getAllPosts({
        page: currentPage,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter as any,
      });
    },
    staleTime: 0, // Always consider data stale to ensure fresh data
  });

  console.log('📄 BlogManagement: React Query state:', {
    isLoading,
    postsData,
    postsCount: postsData?.posts?.length || 0,
    pagination: postsData?.pagination
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (id: number) => blogApi.admin.deletePost(id),
    onSuccess: () => {
      toast({
        title: 'Post deleted',
        description: 'Blog post has been deleted successfully.',
      });
      // Invalidate all blog post queries regardless of parameters
      queryClient.invalidateQueries({ 
        queryKey: ['admin-blog-posts'],
        exact: false 
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete blog post.',
        variant: 'destructive',
      });
    },
  });

  const posts = postsData?.posts || [];
  const pagination = postsData?.pagination;

  const handleDeletePost = (id: number) => {
    if (confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      deletePostMutation.mutate(id);
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setShowAddDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Manage your blog posts and content</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? 'Edit Blog Post' : 'Add New Blog Post'}
              </DialogTitle>
            </DialogHeader>
            <AddBlogPost
              editingPost={editingPost}
              onSuccess={() => {
                setShowAddDialog(false);
                setEditingPost(null);
                queryClient.invalidateQueries({ 
                  queryKey: ['admin-blog-posts'],
                  exact: false 
                });
                refetch();
              }}
              onCancel={() => {
                setShowAddDialog(false);
                setEditingPost(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Edit className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first blog post to get started.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{post.title}</h3>
                            {post.featured && (
                              <Badge className="bg-orange-100 text-orange-800">Featured</Badge>
                            )}
                            {getStatusBadge(post.status)}
                          </div>
                          <p className="text-gray-600 mb-2 line-clamp-2">{post.excerpt}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {post.author}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {post.views} views
                            </div>
                            <div className="flex items-center gap-1">
                              <Tag className="h-4 w-4" />
                              {post.category}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
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
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
