import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { blogApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useToast } from '@/hooks/use-toast';

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
  tags: string[];
}

interface AddBlogPostProps {
  editingPost?: BlogPost | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddBlogPost: React.FC<AddBlogPostProps> = ({ editingPost, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    featured: false,
    readTime: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (editingPost) {
      setFormData({
        title: editingPost.title,
        excerpt: editingPost.excerpt,
        content: editingPost.content,
        category: editingPost.category,
        status: editingPost.status,
        featured: editingPost.featured,
        readTime: editingPost.readTime,
      });
    }
  }, [editingPost]);

  const createPostMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (editingPost) {
        return blogApi.admin.updatePost(editingPost.id, data);
      } else {
        return blogApi.admin.createPost(data);
      }
    },
    onSuccess: () => {
      toast({
        title: editingPost ? 'Post updated' : 'Post created',
        description: editingPost ? 'Blog post has been updated successfully.' : 'Blog post has been created successfully.',
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: `Failed to ${editingPost ? 'update' : 'create'} blog post.`,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.category) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('excerpt', formData.excerpt);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('status', formData.status);
    formDataToSend.append('featured', formData.featured.toString());
    formDataToSend.append('readTime', formData.readTime);

    createPostMutation.mutate(formDataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter blog post title"
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tips">Tips & Advice</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
              <SelectItem value="seasonal">Seasonal</SelectItem>
              <SelectItem value="industry">Industry News</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="readTime">Read Time</Label>
          <Input
            id="readTime"
            value={formData.readTime}
            onChange={(e) => setFormData(prev => ({ ...prev, readTime: e.target.value }))}
            placeholder="e.g., 5 min read"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
          />
          <Label htmlFor="featured">Featured Post</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
          placeholder="Brief description of the blog post"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="content">Content *</Label>
        <RichTextEditor
          value={formData.content}
          onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
          placeholder="Write your blog post content..."
          className="min-h-[300px]"
        />
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={createPostMutation.isPending}>
          {createPostMutation.isPending ? 'Saving...' : (editingPost ? 'Update Post' : 'Create Post')}
        </Button>
      </div>
    </form>
  );
};
