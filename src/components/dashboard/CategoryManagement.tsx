
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { productsApi } from "@/lib/api";
import { uploadApi } from "@/lib/api";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import React, { useState, useEffect } from "react";
import { Edit, Trash2, Plus } from "lucide-react";

export function CategoryManagement() {
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formFields, setFormFields] = useState<any>({ name: "", slug: "", description: "", icon: "", image: "", isActive: true, sortOrder: 0, parentId: "" });
  const [imageUploading, setImageUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number|null>(null);

  useEffect(() => { fetchCategories(); }, []);
  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await productsApi.getCategories?.();
      setCategories(res?.categories || []);
    } catch (err) {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (editingId) {
        await productsApi.updateCategory(editingId, { ...formFields, parentId: formFields.parentId ? Number(formFields.parentId) : null });
      } else {
        await productsApi.createCategory({ ...formFields, parentId: formFields.parentId ? Number(formFields.parentId) : null });
      }
      setShowForm(false);
      setEditingId(null);
      setFormFields({ name: "", slug: "", description: "", icon: "", image: "", isActive: true, sortOrder: 0, parentId: "" });
      fetchCategories();
    } catch (err) {
      setError("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Category Management</h2>
          <p className="text-muted-foreground">Manage your product categories</p>
        </div>
        <Button className="btn-primary-modern flex items-center space-x-2" onClick={() => { setShowForm(true); setEditingId(null); setFormFields({ name: "", slug: "", description: "", icon: "", image: "", isActive: true, sortOrder: 0, parentId: "" }); }}>
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </Button>
      </div>
      {/* Category Form Modal/Inline */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Category" : "Create Category"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input placeholder="Category Name" value={formFields.name} onChange={e => setFormFields(f => ({ ...f, name: e.target.value }))} className="w-full" />
              <Input placeholder="Slug (e.g. suv)" value={formFields.slug} onChange={e => setFormFields(f => ({ ...f, slug: e.target.value }))} className="w-full" />
              <Input placeholder="Description" value={formFields.description} onChange={e => setFormFields(f => ({ ...f, description: e.target.value }))} className="w-full" />
              <Input placeholder="Icon name or URL" value={formFields.icon} onChange={e => setFormFields(f => ({ ...f, icon: e.target.value }))} className="w-full" />
              <div className="w-full">
                <label className="block font-medium mb-1">Category Image</label>
                <ImageDropzone
                  onUpload={async (files) => {
                    setImageUploading(true);
                    try {
                      const result = await uploadApi.single(files[0], 'categories');
                      setFormFields(f => ({ ...f, image: result?.url || result?.imageUrl || "" }));
                      return [{ imageUrl: result?.url || result?.imageUrl || "", originalName: files[0].name }];
                    } finally {
                      setImageUploading(false);
                    }
                  }}
                  maxFiles={1}
                  multiple={false}
                  existingImages={formFields.image ? [{ imageUrl: formFields.image }] : []}
                  className="mb-2"
                />
                {formFields.image && (
                  <div className="mt-2">
                    <img src={formFields.image} alt="Category" className="w-16 h-16 rounded border" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="font-medium">Active</label>
                <input type="checkbox" checked={formFields.isActive} onChange={e => setFormFields(f => ({ ...f, isActive: e.target.checked }))} className="h-5 w-5" />
              </div>
              <Input type="number" placeholder="Sort Order" value={formFields.sortOrder} onChange={e => setFormFields(f => ({ ...f, sortOrder: Number(e.target.value) }))} className="w-full" />
              <select value={formFields.parentId} onChange={e => setFormFields(f => ({ ...f, parentId: e.target.value }))} className="w-full border rounded px-2 py-1">
                <option value="">None</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <Button type="submit" disabled={loading} className="col-span-1 md:col-span-2">{loading ? "Saving..." : (editingId ? "Save Changes" : "Add Category")}</Button>
              <Button type="button" variant="outline" className="col-span-1 md:col-span-2" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
            </form>
            {error && <div className="text-red-500 mb-2">{error}</div>}
          </CardContent>
        </Card>
      )}
      {/* Categories Table */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No categories found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat: any) => (
                  <TableRow key={cat.id} className="hover:bg-muted/50">
                    <TableCell>{cat.name}</TableCell>
                    <TableCell>{cat.slug}</TableCell>
                    <TableCell>{cat.description}</TableCell>
                    <TableCell>{cat.icon}</TableCell>
                    <TableCell>{cat.image ? <img src={cat.image} alt="icon" className="w-8 h-8 rounded" /> : '-'}</TableCell>
                    <TableCell>{cat.sortOrder}</TableCell>
                    <TableCell>{cat.isActive ? <span className="text-green-600">Active</span> : <span className="text-red-500">Inactive</span>}</TableCell>
                    <TableCell>{cat.parentId ? categories.find((c: any) => c.id === cat.parentId)?.name : '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" className="hover:bg-secondary" onClick={() => { setShowForm(true); setEditingId(cat.id); setFormFields({ ...cat, parentId: cat.parentId || "" }); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={async () => { if (window.confirm("Delete this category?")) { await productsApi.deleteCategory(cat.id); fetchCategories(); } }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
