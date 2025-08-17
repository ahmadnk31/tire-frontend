
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bannersApi } from '@/lib/bannersApi';
// Removed Dialog imports
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { ImageDropzone } from '@/components/ui/image-dropzone';
import { uploadApi } from '@/lib/api';

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
    setShowForm(true);
  };
  const openEdit = (banner: Banner) => {
    setEditBanner(banner);
    setForm(banner);
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditBanner(null);
    setForm({ type: 'image', isActive: true, sortOrder: 0 });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.src) {
      toast({ title: 'Image required', description: 'Please upload a banner image.', variant: 'destructive' });
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
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={form.type || 'image'}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value, src: '' }))}
                  required
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              {form.type === 'image' ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Banner Image</label>
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
                <div>
                  <label className="block text-sm font-medium mb-1">Video URL</label>
                  <Input
                    value={form.src || ''}
                    onChange={e => setForm(f => ({ ...f, src: e.target.value }))}
                    placeholder="https://..."
                    required={form.type === 'video'}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Headline</label>
                <Input
                  value={form.headline || ''}
                  onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subheadline</label>
                <Input
                  value={form.subheadline || ''}
                  onChange={e => setForm(f => ({ ...f, subheadline: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  value={form.description || ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sort Order</label>
                <Input
                  type="number"
                  value={form.sortOrder || 0}
                  onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  id="isActive"
                />
                <label htmlFor="isActive" className="text-sm">Active</label>
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={createBanner.status === 'pending' || updateBanner.status === 'pending'}>
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

  {/* Removed modal dialog, now using inline form above */}
    </div>
  );
};
