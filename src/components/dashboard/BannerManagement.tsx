
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bannersApi } from '@/lib/bannersApi';
// Removed Dialog imports
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { ImageDropzone } from '@/components/ui/image-dropzone';
import { VideoDropzone } from '@/components/ui/video-dropzone';
import { uploadApi } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Banner {
  id: number;
  type: string;
  src: string;
  headline?: string;
  subheadline?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export const BannerManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState<Partial<Banner>>({ type: 'image', isActive: true, sortOrder: 0 });
  const [uploading, setUploading] = useState(false);
  const [videoUploadType, setVideoUploadType] = useState<'upload' | 'url'>('upload');

  // Fetch banners
  const {
    data: banners,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      try {
        const res = await bannersApi.getAll();
        return Array.isArray(res) ? res : res.banners || [];
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err?.message || 'Failed to load banners.',
          variant: 'destructive',
        });
        return [];
      }
    },
  });

  // Create banner
  const createBanner = useMutation({
    mutationFn: async (data: Partial<Banner>) => {
      const token = localStorage.getItem('token');
      return bannersApi.create(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setShowForm(false);
      setForm({ type: 'image', isActive: true, sortOrder: 0 });
      toast({ title: 'Banner created' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.message || 'Failed to create banner', variant: 'destructive' });
    },
  });

  // Update banner
  const updateBanner = useMutation({
    mutationFn: async (data: Partial<Banner>) => {
      const token = localStorage.getItem('token');
      if (!editBanner) throw new Error('No banner selected');
      return bannersApi.update(editBanner.id, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setShowForm(false);
      setEditBanner(null);
      setForm({ type: 'image', isActive: true, sortOrder: 0 });
      toast({ title: 'Banner updated' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.message || 'Failed to update banner', variant: 'destructive' });
    },
  });

  // Delete banner
  const deleteBanner = useMutation({
    mutationFn: async (id: number) => {
      return bannersApi.remove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({ title: 'Banner deleted' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.message || 'Failed to delete banner', variant: 'destructive' });
    },
  });

  const openCreate = () => {
    setEditBanner(null);
    setForm({ type: 'image', isActive: true, sortOrder: 0 });
    setVideoUploadType('upload');
    setShowForm(true);
  };
  
  const openEdit = (banner: Banner) => {
    setEditBanner(banner);
    setForm(banner);
    // Determine video upload type based on existing src
    if (banner.type === 'video') {
      setVideoUploadType(banner.src.startsWith('http') ? 'url' : 'upload');
    }
    setShowForm(true);
  };
  
  const closeForm = () => {
    setShowForm(false);
    setEditBanner(null);
    setForm({ type: 'image', isActive: true, sortOrder: 0 });
    setVideoUploadType('upload');
  };

  // Handle image upload
  const handleImageUpload = async (files: File[]) => {
    setUploading(true);
    try {
      const uploaded = await uploadApi.single(files[0], 'banners');
      setForm(f => ({ ...f, src: uploaded.imageUrl }));
      return [{ imageUrl: uploaded.imageUrl, originalName: files[0].name }];
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err?.message || 'Failed to upload image', variant: 'destructive' });
      return [];
    } finally {
      setUploading(false);
    }
  };

  // Handle video upload
  const handleVideoUpload = async (files: File[]) => {
    setUploading(true);
    try {
      const uploaded = await uploadApi.video(files[0], 'banners');
      setForm(f => ({ ...f, src: uploaded.videoUrl }));
      return [{ imageUrl: uploaded.videoUrl, originalName: files[0].name }];
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err?.message || 'Failed to upload video', variant: 'destructive' });
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.src) {
      toast({ title: 'Media required', description: 'Please upload a banner image/video or provide a video URL.', variant: 'destructive' });
      return;
    }
    if (editBanner) updateBanner.mutate(form);
    else createBanner.mutate(form);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Banner Management</h2>
        <Button variant="outline" onClick={openCreate}>Add Banner</Button>
      </div>

      {/* Inline Create/Edit Form */}
      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editBanner ? 'Edit Banner' : 'Add Banner'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={form.type || 'image'}
                  onValueChange={(value) => {
                    setForm(f => ({ ...f, type: value, src: '' }));
                    if (value === 'video') {
                      setVideoUploadType('upload');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.type === 'image' ? (
                <div>
                  <Label>Banner Image</Label>
                  <ImageDropzone
                    onUpload={handleImageUpload}
                    maxFiles={1}
                    multiple={false}
                    folder="banners"
                    existingImages={form.src ? [{ imageUrl: form.src }] : []}
                    className="mb-2"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Video Source</Label>
                    <Select
                      value={videoUploadType}
                      onValueChange={(value: 'upload' | 'url') => {
                        setVideoUploadType(value);
                        setForm(f => ({ ...f, src: '' }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upload">Upload Video File</SelectItem>
                        <SelectItem value="url">Video URL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {videoUploadType === 'upload' ? (
                    <div>
                      <Label>Upload Video</Label>
                      <VideoDropzone
                        onUpload={handleVideoUpload}
                        maxFiles={1}
                        multiple={false}
                        folder="banners"
                        existingVideos={form.src ? [{ imageUrl: form.src, originalName: 'Uploaded Video' }] : []}
                        className="mb-2"
                        maxSize={100}
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="videoUrl">Video URL</Label>
                      <Input
                        id="videoUrl"
                        value={form.src || ''}
                        onChange={e => setForm(f => ({ ...f, src: e.target.value }))}
                        placeholder="https://example.com/video.mp4"
                        required={form.type === 'video'}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supported formats: MP4, MOV, AVI, WEBM, MKV
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={form.headline || ''}
                  onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="subheadline">Subheadline</Label>
                <Input
                  id="subheadline"
                  value={form.subheadline || ''}
                  onChange={e => setForm(f => ({ ...f, subheadline: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={form.description || ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={form.sortOrder || 0}
                  onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!!form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  id="isActive"
                />
                <Label htmlFor="isActive" className="text-sm">Active</Label>
              </div>

              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={createBanner.isPending || updateBanner.isPending}>
                  {editBanner ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="py-12 text-center">Loading banners...</div>
      ) : isError ? (
        <div className="py-12 text-center text-red-500">Failed to load banners.</div>
      ) : !banners || banners.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">No banners found.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner: Banner) => (
            <Card key={banner.id}>
              <CardHeader>
                <CardTitle>{banner.headline || "(No headline)"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Type:</span> {banner.type}
                </div>
                <div className="mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Active:</span> {banner.isActive ? "Yes" : "No"}
                </div>
                <div className="mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Sort Order:</span> {banner.sortOrder}
                </div>
                <div className="mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Source:</span> <a href={banner.src} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">{banner.src}</a>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => openEdit(banner)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteBanner.mutate(banner.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
