import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Check, X, Trash2, Eye, Clock, AlertTriangle } from 'lucide-react';
import { blogApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: number;
  content: string;
  authorName: string;
  authorEmail: string;
  status: 'pending' | 'approved' | 'spam';
  createdAt: string;
  postTitle: string;
  postSlug: string;
}

const CommentsManagement: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch comments
  const { data: commentsData, isLoading, refetch } = useQuery({
    queryKey: ['admin-blog-comments', currentPage, statusFilter, searchTerm],
    queryFn: () => {
      console.log('🔄 CommentsManagement: React Query fetching with params:', {
        page: currentPage,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm
      });
      return blogApi.admin.getAllComments({
        page: currentPage,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter as any,
      });
    },
    staleTime: 0,
  });

  console.log('📄 CommentsManagement: React Query state:', {
    isLoading,
    commentsData,
    commentsCount: commentsData?.comments?.length || 0,
    pagination: commentsData?.pagination
  });

  // Update comment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'pending' | 'approved' | 'spam' }) =>
      blogApi.admin.updateCommentStatus(id, status),
    onSuccess: () => {
      toast({
        title: 'Status updated',
        description: 'Comment status has been updated successfully.',
      });
      queryClient.invalidateQueries({ 
        queryKey: ['admin-blog-comments'],
        exact: false 
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update comment status.',
        variant: 'destructive',
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (id: number) => blogApi.admin.deleteComment(id),
    onSuccess: () => {
      toast({
        title: 'Comment deleted',
        description: 'Comment has been deleted successfully.',
      });
      queryClient.invalidateQueries({ 
        queryKey: ['admin-blog-comments'],
        exact: false 
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete comment.',
        variant: 'destructive',
      });
    },
  });

  const comments: Comment[] = commentsData?.comments || [];
  const pagination = commentsData?.pagination;

  const handleStatusUpdate = (id: number, status: 'pending' | 'approved' | 'spam') => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDeleteComment = (id: number) => {
    if (confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      deleteCommentMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'spam':
        return <Badge className="bg-red-100 text-red-800">Spam</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'spam':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Comments Management</h1>
          <p className="text-muted-foreground">Manage blog comments and moderation</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Comments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No comments found</h3>
          <p className="text-gray-500">There are no comments matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(comment.status)}
                  <div>
                    <h4 className="font-medium">{comment.authorName}</h4>
                    <p className="text-sm text-gray-500">{comment.authorEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(comment.status)}
                  <div className="flex gap-1">
                    {comment.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(comment.id, 'approved')}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(comment.id, 'spam')}
                          disabled={updateStatusMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deleteCommentMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">{comment.content}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>On: {comment.postTitle}</span>
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommentsManagement;
