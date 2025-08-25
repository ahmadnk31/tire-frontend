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
import { ImageDropzone } from '@/components/ui/image-dropzone';
import { uploadApi } from '@/lib/api';

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

// Storage keys for form persistence
const FORM_STORAGE_KEY = 'blog-post-form-data';
const FEATURED_IMAGE_STORAGE_KEY = 'blog-post-featured-image';

export const AddBlogPost: React.FC<AddBlogPostProps> = ({ editingPost, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    status: 'published' as 'draft' | 'published' | 'archived',
    featured: false,
    readTime: '',
  });
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  // Helper functions for localStorage
  const saveFormToStorage = (data: typeof formData, image: string | null) => {
    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(FEATURED_IMAGE_STORAGE_KEY, image || '');
    } catch (error) {
      console.error('Failed to save form to localStorage:', error);
    }
  };

  const loadFormFromStorage = () => {
    try {
      const savedData = localStorage.getItem(FORM_STORAGE_KEY);
      const savedImage = localStorage.getItem(FEATURED_IMAGE_STORAGE_KEY);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        setHasUnsavedChanges(true);
      }
      
      if (savedImage && savedImage !== 'null') {
        setFeaturedImage(savedImage);
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error('Failed to load form from localStorage:', error);
    }
  };

  const clearFormStorage = () => {
    try {
      localStorage.removeItem(FORM_STORAGE_KEY);
      localStorage.removeItem(FEATURED_IMAGE_STORAGE_KEY);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to clear form storage:', error);
    }
  };

  // Load saved data on mount (only for new posts, not editing)
  useEffect(() => {
    if (!editingPost) {
      loadFormFromStorage();
    }
  }, [editingPost]);

  // Save form data on changes (debounced)
  useEffect(() => {
    if (!editingPost) { // Only save for new posts
      const timeoutId = setTimeout(() => {
        saveFormToStorage(formData, featuredImage);
        setHasUnsavedChanges(true);
      }, 1000); // Save after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [formData, featuredImage, editingPost]);

  // Warn before unload if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !editingPost) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, editingPost]);

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
      setFeaturedImage(editingPost.image);
      setHasUnsavedChanges(false);
    }
  }, [editingPost]);

  // Handle image upload for rich text editor
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const uploaded = await uploadApi.single(file, 'blog');
      return uploaded.imageUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Handle featured image upload
  const handleFeaturedImageUpload = async (files: File[]) => {
    try {
      const uploaded = await uploadApi.single(files[0], 'blog');
      setFeaturedImage(uploaded.imageUrl);
      return [{ imageUrl: uploaded.imageUrl, originalName: files[0].name }];
    } catch (error) {
      console.error('Featured image upload failed:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload featured image. Please try again.',
        variant: 'destructive',
      });
      return [];
    }
  };

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
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
      clearFormStorage(); // Clear saved data on success
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

    const postData = {
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      category: formData.category,
      status: formData.status,
      featured: formData.featured,
      readTime: formData.readTime,
      image: featuredImage || null,
    };

    createPostMutation.mutate(postData);
  };

  // Handle form input changes with persistence
  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Restore saved data
  const restoreSavedData = () => {
    loadFormFromStorage();
    toast({
      title: 'Data restored',
      description: 'Your saved form data has been restored.',
    });
  };

  // Clear saved data
  const clearSavedData = () => {
    clearFormStorage();
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      status: 'published',
      featured: false,
      readTime: '',
    });
    setFeaturedImage(null);
    setHasUnsavedChanges(false);
    toast({
      title: 'Data cleared',
      description: 'All saved form data has been cleared.',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Unsaved changes indicator */}
      {!editingPost && hasUnsavedChanges && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-orange-700 font-medium">Unsaved changes</span>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={restoreSavedData}
            className="h-6 px-2 text-xs text-orange-700 hover:text-orange-800"
          >
            Restore
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={clearSavedData}
            className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
          >
            Clear
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter blog post title"
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
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
          <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as any)}>
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
            onChange={(e) => handleInputChange('readTime', e.target.value)}
            placeholder="e.g., 5 min read"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) => handleInputChange('featured', checked)}
          />
          <Label htmlFor="featured">Featured Post</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => handleInputChange('excerpt', e.target.value)}
          placeholder="Brief description of the blog post"
          rows={3}
        />
      </div>

      <div>
        <Label>Featured Image</Label>
        <ImageDropzone
          onUpload={handleFeaturedImageUpload}
          maxFiles={1}
          multiple={false}
          folder="blog"
          existingImages={featuredImage ? [{ imageUrl: featuredImage }] : []}
          className="mb-2"
        />
        <p className="text-xs text-gray-500 mt-1">
          This image will be used as the blog post thumbnail and featured image
        </p>
      </div>

      <div>
        <Label htmlFor="content">Content *</Label>
        <RichTextEditor
          value={formData.content}
          onChange={(value) => handleInputChange('content', value)}
          placeholder="Write your blog post content..."
          className="min-h-[300px]"
          uploadImage={handleImageUpload}
        />
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (!editingPost && hasUnsavedChanges) {
              if (confirm('You have unsaved changes. Are you sure you want to cancel? Your data will be lost.')) {
                clearFormStorage();
                onCancel();
              }
            } else {
              onCancel();
            }
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={createPostMutation.isPending}>
          {createPostMutation.isPending ? 'Saving...' : (editingPost ? 'Update Post' : 'Create Post')}
        </Button>
      </div>
    </form>
  );
};
