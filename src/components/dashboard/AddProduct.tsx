import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { Plus, X, Save, Eye, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient, { uploadApi, productsApi } from "@/lib/api";
import { CategoryTreeSelector } from "./CategoryTreeSelector";

interface Product {
  id: number;
  name: string;
  brand: string;
  model: string;
  size: string;
  price: string | number;
  stock: number;
  status: string;
  featured: boolean;
  sku: string;
  rating?: string;
  reviews?: number;
  description?: string;
  features?: string[];
  tags?: string[] | string;
  images?: Array<string | { imageUrl: string; altText?: string }>;
  productImages?: Array<{ imageUrl: string; altText?: string }>;
  specifications?: {
    speedRating?: string;
    loadIndex?: string;
    seasonType?: string;
    vehicleType?: string;
    treadDepth?: number | string;
    construction?: string;
  };
  comparePrice?: string | number;
  compareAtPrice?: string | number;
  stockQuantity?: number | string;
  lowStockThreshold?: number | string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  categoryIds?: number[];
}

interface AddProductProps {
  editingProduct?: Product | null;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export const AddProduct = ({ editingProduct, onCancel, onSuccess }: AddProductProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<{ imageUrl: string; altText: string }[]>([]);
  const [features, setFeatures] = useState<string[]>(['']);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    description: '',
   
    
    name: '',
    features: [''],
    size: '',
    
    speedRating: '',
    loadIndex: '',
    seasonType: '',
    vehicleType: '',
    treadDepth: '',
    construction: 'radial',
    price: '',
    comparePrice: '',
    sku: '',
    stock: '',
    lowStockThreshold: '10',
    visibility: 'published',
    featured: 'no',
    tags: '',
    metaTitle: '',
    metaDescription: '',
    categoryIds: []
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch categories and initialize form data with editing product if provided
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await productsApi.getCategories();
        setCategories(res?.categories || []);
      } catch {
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
    if (editingProduct) {
      const sizeParts = editingProduct.size ? editingProduct.size.match(/(\d+)\/(\d+)R(\d+)/) : null;
      setFormData({
        brand: editingProduct.brand || '',
        model: editingProduct.model || '',
        description: editingProduct.description || '',
        
        
        name: editingProduct.name || '',
        size: editingProduct.size || '',
        features: Array.isArray(editingProduct.features) && editingProduct.features.length > 0 ? editingProduct.features : [''],
        
        speedRating: editingProduct.specifications?.speedRating || '',
        loadIndex: editingProduct.specifications?.loadIndex || '',
        seasonType: editingProduct.specifications?.seasonType || '',
        vehicleType: editingProduct.specifications?.vehicleType || '',
        treadDepth: editingProduct.specifications?.treadDepth?.toString() || '',
        construction: editingProduct.specifications?.construction || 'radial',
        price: (editingProduct.price || '').toString().replace('$', ''),
        comparePrice: (editingProduct.comparePrice || editingProduct.compareAtPrice || '').toString(),
        sku: editingProduct.sku || '',
        stock: (editingProduct.stock || editingProduct.stockQuantity || '').toString(),
        lowStockThreshold: (editingProduct.lowStockThreshold || '10').toString(),
        visibility: editingProduct.status || 'published',
        featured: editingProduct.featured ? 'yes' : 'no',
        tags: Array.isArray(editingProduct.tags) ? editingProduct.tags.join(', ') : (editingProduct.tags || ''),
        metaTitle: editingProduct.seo?.metaTitle || '',
        metaDescription: editingProduct.seo?.metaDescription || '',
        categoryIds: editingProduct.categoryIds || []
      });
      setFeatures(Array.isArray(editingProduct.features) && editingProduct.features.length > 0 ? editingProduct.features : ['']);
      let imgs = [];
      if (Array.isArray(editingProduct.images) && editingProduct.images.length > 0) {
        imgs = editingProduct.images.map((img: any) =>
          typeof img === 'string' ? { imageUrl: img, altText: editingProduct.name } : { imageUrl: img.imageUrl, altText: img.altText || editingProduct.name }
        );
      } else if (Array.isArray(editingProduct.productImages) && editingProduct.productImages.length > 0) {
        imgs = editingProduct.productImages.map((img: any) => ({ imageUrl: img.imageUrl, altText: img.altText || editingProduct.name }));
      }
      setUploadedImages(imgs);
    }
  }, [editingProduct]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (files: File[]) => {
    try {
      const response = await uploadApi.multiple(files, 'products');

      const uploadResults = response.results.map((result: any) => ({
        imageUrl: result.imageUrl,
        altText: result.originalName
      }));

      setUploadedImages(prev => [...prev, ...uploadResults]);
      return uploadResults;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload images');
    }
  };

  const handleSubmit = async (isDraft = false) => {
    try {
      setIsSubmitting(true);

      // Validate required fields
  const requiredFields = ['name', 'size', 'brand', 'model', 'speedRating', 'loadIndex', 'seasonType', 'vehicleType', 'price', 'stock'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

      if (missingFields.length > 0 && !isDraft) {
        toast({
          title: "Missing required fields",
          description: `Please fill in: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      // Use provided name and size
      const productData = {
        name: formData.name,
        size: formData.size,
        brand: formData.brand,
        model: formData.model,
        price: parseFloat(formData.price) || 0,
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        description: formData.description,
        // Flatten specifications to top-level fields
        speedRating: formData.speedRating,
        loadIndex: formData.loadIndex,
        seasonType: formData.seasonType,
        tireType: formData.vehicleType, // Map vehicleType to tireType
        // Flatten SEO fields
        seoTitle: formData.metaTitle,
        seoDescription: formData.metaDescription,
        // Keep features as an array but join for storage
        features: features.filter(f => f.trim()).join(','),
        images: (uploadedImages.length > 0
          ? uploadedImages
          : (editingProduct?.productImages || editingProduct?.images || [])),
        sku: formData.sku || undefined,
        stock: parseInt(formData.stock) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
        status: isDraft ? 'draft' : formData.visibility,
        featured: formData.featured === 'yes',
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean).join(','),
        categoryIds: formData.categoryIds
      };

      console.log('Submitting images:', productData.images);
      let response;
      if (editingProduct) {
        response = await productsApi.update(editingProduct.id.toString(), productData);
      } else {
        response = await productsApi.create(productData);
      }

      toast({
        title: isDraft ? "Draft saved" : (editingProduct ? "Product updated" : "Product created"),
        description: isDraft ? "Product saved as draft successfully." : 
                     editingProduct ? "Product updated successfully." : "Product created and published successfully.",
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Reset form if not editing
      if (!editingProduct) {
        setFormData({
          brand: '',
          model: '',
          description: '',
          name: '',
          size: '',
          features: [''],
          speedRating: '',
          loadIndex: '',
          seasonType: '',
          vehicleType: '',
          treadDepth: '',
          construction: 'radial',
          price: '',
          comparePrice: '',
          sku: '',
          stock: '',
          lowStockThreshold: '10',
          visibility: 'published',
          featured: 'no',
          tags: '',
          metaTitle: '',
          metaDescription: '',
          categoryIds: []
        });
        setFeatures(['']);
        setUploadedImages([]);
      }

    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save product. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {onCancel && (
            <Button variant="outline" size="icon" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h2 className="text-3xl font-bold">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-muted-foreground">
              {editingProduct ? 'Update product information' : 'Create a new tire product listing'}
            </p>
          </div>
        </div>
        <div className="space-x-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button 
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Publish Product')}
          </Button>
        </div>
      </div>

  <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Product Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Michelin Pilot Sport 4 225/45R17"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size *</Label>
                  <Input
                    id="size"
                    placeholder="e.g., 225/45R17"
                    value={formData.size}
                    onChange={e => handleInputChange('size', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="michelin">Michelin</SelectItem>
                      <SelectItem value="continental">Continental</SelectItem>
                      <SelectItem value="bridgestone">Bridgestone</SelectItem>
                      <SelectItem value="pirelli">Pirelli</SelectItem>
                      <SelectItem value="goodyear">Goodyear</SelectItem>
                      <SelectItem value="dunlop">Dunlop</SelectItem>
                      <SelectItem value="yokohama">Yokohama</SelectItem>
                      <SelectItem value="hankook">Hankook</SelectItem>
                      <SelectItem value="ovation">Ovation</SelectItem>
                      <SelectItem value="double-star">Double Star</SelectItem>
                      <SelectItem value="tracmax">Tracmax</SelectItem>
                      <SelectItem value="rotalla">Rotalla</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model Name *</Label>
                  <Input 
                    id="model" 
                    placeholder="e.g., Pilot Sport 4" 
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                  />
                </div>
              </div>
              {/* Multi-Category Selector with expandable folders for children */}
              <div className="space-y-2">
                <Label htmlFor="categoryIds">Categories</Label>
                  <CategoryTreeSelector
                    categories={categories}
                    selected={formData.categoryIds}
                    onChange={ids => handleInputChange('categoryIds', ids)}
                  />
                </div>

              <div className="space-y-2">
                <Label htmlFor="description">Product Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe the tire's features, benefits, and ideal use cases..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Key Features</Label>
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="e.g., Enhanced wet grip technology"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      disabled={features.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addFeature} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
             

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="speedRating">Speed Rating *</Label>
                  <Select value={formData.speedRating} onValueChange={(value) => handleInputChange('speedRating', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Speed rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q">Q (99 mph)</SelectItem>
                      <SelectItem value="R">R (106 mph)</SelectItem>
                      <SelectItem value="S">S (112 mph)</SelectItem>
                      <SelectItem value="T">T (118 mph)</SelectItem>
                      <SelectItem value="U">U (124 mph)</SelectItem>
                      <SelectItem value="H">H (130 mph)</SelectItem>
                      <SelectItem value="V">V (149 mph)</SelectItem>
                      <SelectItem value="W">W (168 mph)</SelectItem>
                      <SelectItem value="Y">Y (186 mph)</SelectItem>
                      <SelectItem value="Z">Z (149+ mph)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loadIndex">Load Index *</Label>
                  <Input 
                    id="loadIndex" 
                    placeholder="e.g., 91 (615 kg)" 
                    value={formData.loadIndex}
                    onChange={(e) => handleInputChange('loadIndex', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seasonType">Season Type *</Label>
                  <Select value={formData.seasonType} onValueChange={(value) => handleInputChange('seasonType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Season type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summer">Summer</SelectItem>
                      <SelectItem value="winter">Winter</SelectItem>
                      <SelectItem value="all-season">All Season</SelectItem>
                      <SelectItem value="all-weather">All Weather</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type *</Label>
                  <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange('vehicleType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passenger">Passenger Car</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="truck">Light Truck</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="treadDepth">Tread Depth (mm)</Label>
                  <Input 
                    id="treadDepth" 
                    placeholder="e.g., 8.5" 
                    value={formData.treadDepth}
                    onChange={(e) => handleInputChange('treadDepth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="construction">Construction Type</Label>
                  <Select value={formData.construction} onValueChange={(value) => handleInputChange('construction', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Construction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="radial">Radial</SelectItem>
                      <SelectItem value="bias">Bias</SelectItem>
                      <SelectItem value="bias-belted">Bias Belted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
              </div>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageDropzone
                onUpload={handleImageUpload}
                maxFiles={8}
                multiple={true}
                folder="products"
                existingImages={uploadedImages}
                className="w-full"
              />
              {uploadedImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    {uploadedImages.length} image(s) uploaded successfully
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input 
                    id="price" 
                    className="pl-8" 
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comparePrice">Compare at Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input 
                    id="comparePrice" 
                    className="pl-8" 
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    value={formData.comparePrice}
                    onChange={(e) => handleInputChange('comparePrice', e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input 
                  id="sku" 
                  placeholder="Auto-generated" 
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  placeholder="0" 
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                <Input 
                  id="lowStockThreshold" 
                  type="number" 
                  placeholder="10" 
                  value={formData.lowStockThreshold}
                  onChange={(e) => handleInputChange('lowStockThreshold', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Status */}
          <Card>
            <CardHeader>
              <CardTitle>Product Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select value={formData.visibility} onValueChange={(value) => handleInputChange('visibility', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Featured Product</Label>
                <Select value={formData.featured} onValueChange={(value) => handleInputChange('featured', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags && formData.tags.split(',').map((tag, index) => (
                    tag.trim() && <Badge key={index} variant="secondary">{tag.trim()}</Badge>
                  ))}
                </div>
                <Input 
                  placeholder="Add tags separated by commas..." 
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input 
                  id="metaTitle" 
                  placeholder="Auto-generated from product name" 
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea 
                  id="metaDescription" 
                  placeholder="Brief description for search engines..." 
                  rows={3} 
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};