import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { Plus, X, Save, Eye, ArrowLeft, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient, { uploadApi, productsApi } from "@/lib/api";
import { CategoryTreeSelector } from "./CategoryTreeSelector";

// Form persistence keys
const FORM_STORAGE_KEY = 'addProduct_formData';
const FEATURES_STORAGE_KEY = 'addProduct_features';
const IMAGES_STORAGE_KEY = 'addProduct_images';

// Helper functions for form persistence
const saveFormToStorage = (formData: any, features: string[], uploadedImages: any[]) => {
  try {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    localStorage.setItem(FEATURES_STORAGE_KEY, JSON.stringify(features));
    localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(uploadedImages));
  } catch (error) {
    console.warn('Failed to save form data to localStorage:', error);
  }
};

const loadFormFromStorage = () => {
  try {
    const formData = localStorage.getItem(FORM_STORAGE_KEY);
    const features = localStorage.getItem(FEATURES_STORAGE_KEY);
    const images = localStorage.getItem(IMAGES_STORAGE_KEY);
    
    return {
      formData: formData ? JSON.parse(formData) : null,
      features: features ? JSON.parse(features) : null,
      images: images ? JSON.parse(images) : null,
    };
  } catch (error) {
    console.warn('Failed to load form data from localStorage:', error);
    return { formData: null, features: null, images: null };
  }
};

const clearFormStorage = () => {
  try {
    localStorage.removeItem(FORM_STORAGE_KEY);
    localStorage.removeItem(FEATURES_STORAGE_KEY);
    localStorage.removeItem(IMAGES_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear form data from localStorage:', error);
  }
};

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
    tireType?: string;
    treadDepth?: number | string;
    construction?: string;
  };
  // Individual specification fields for backward compatibility
  speedRating?: string;
  loadIndex?: string;
  seasonType?: string;
  tireType?: string;
  treadDepth?: string | number;
  construction?: string;
  comparePrice?: string | number;
  compareAtPrice?: string | number;
  stockQuantity?: number | string;
  lowStockThreshold?: number | string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  // SEO fields for backward compatibility
  seoTitle?: string;
  seoDescription?: string;
  categoryIds?: number[];
  // Sale fields
  saleStartDate?: string;
  saleEndDate?: string;
}

interface AddProductProps {
  editingProduct?: Product | null;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export const AddProduct = ({ editingProduct, onCancel, onSuccess }: AddProductProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<{ imageUrl: string; altText?: string }[]>([]);
  const [features, setFeatures] = useState<string[]>(['']);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    description: '',
    name: '',
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
    categoryIds: [],
    // Sale fields
    saleStartDate: '',
    saleEndDate: ''
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  // Fetch categories and initialize form data
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

    // Load saved form data if not editing a product
    if (!editingProduct) {
      const savedData = loadFormFromStorage();
      if (savedData.formData) {
        setFormData(savedData.formData);
        setHasUnsavedChanges(true);
      }
      if (savedData.features) {
        setFeatures(savedData.features);
      }
      if (savedData.images) {
        setUploadedImages(savedData.images);
      }
    } else {
      // If editing, load the product data and clear any saved form data
      clearFormStorage();
      const sizeParts = editingProduct.size ? editingProduct.size.match(/(\d+)\/(\d+)R(\d+)/) : null;
      setFormData({
        brand: editingProduct.brand || '',
        model: editingProduct.model || '',
        description: editingProduct.description || '',
        name: editingProduct.name || '',
        size: editingProduct.size || '',
        
        // Load specifications from both specifications object and individual fields for backward compatibility
        speedRating: editingProduct.specifications?.speedRating || editingProduct.speedRating || '',
        loadIndex: editingProduct.specifications?.loadIndex || editingProduct.loadIndex || '',
        seasonType: editingProduct.specifications?.seasonType || editingProduct.seasonType || '',
        vehicleType: editingProduct.specifications?.tireType || editingProduct.tireType || '',
        treadDepth: editingProduct.specifications?.treadDepth?.toString() || editingProduct.treadDepth?.toString() || '',
        construction: editingProduct.specifications?.construction || editingProduct.construction || 'radial',
        price: (editingProduct.price || '').toString().replace('$', ''),
        comparePrice: (editingProduct.comparePrice || editingProduct.compareAtPrice || '').toString(),
        sku: editingProduct.sku || '',
        stock: (editingProduct.stock || editingProduct.stockQuantity || '').toString(),
        lowStockThreshold: (editingProduct.lowStockThreshold || '10').toString(),
        visibility: editingProduct.status || 'published',
        featured: editingProduct.featured ? 'yes' : 'no',
        tags: Array.isArray(editingProduct.tags) ? editingProduct.tags.join(', ') : (editingProduct.tags || ''),
        metaTitle: editingProduct.seoTitle || editingProduct.seo?.metaTitle || '',
        metaDescription: editingProduct.seoDescription || editingProduct.seo?.metaDescription || '',
        categoryIds: editingProduct.categoryIds || [],
        // Sale fields
        saleStartDate: editingProduct.saleStartDate || '',
        saleEndDate: editingProduct.saleEndDate || ''
      });
      const productFeatures = Array.isArray(editingProduct.features) && editingProduct.features.length > 0 
        ? editingProduct.features 
        : (typeof editingProduct.features === 'string' 
          ? (editingProduct.features as string).split(',').map(f => f.trim()).filter(f => f)
          : ['']);
      setFeatures(productFeatures);
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

  // Save form data to localStorage whenever it changes (debounced)
  useEffect(() => {
    if (!editingProduct && hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        saveFormToStorage(formData, features, uploadedImages);
      }, 1000); // Save after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [formData, features, uploadedImages, editingProduct, hasUnsavedChanges]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !editingProduct) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, editingProduct]);

  const handleInputChange = (field: string, value: any) => {
    console.log(`🔄 handleInputChange: ${field} =`, value, 'Type:', typeof value);
    setFormData(prev => ({ ...prev, [field]: value }));
    if (!editingProduct) {
      setHasUnsavedChanges(true);
    }
  };

  const addFeature = () => {
    setFeatures([...features, '']);
    if (!editingProduct) {
      setHasUnsavedChanges(true);
    }
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
    if (!editingProduct) {
      setHasUnsavedChanges(true);
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
    if (!editingProduct) {
      setHasUnsavedChanges(true);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    console.log('🚨 FUNCTION CALLED - handleImageUpload');
    try {
      console.log('🔄 Starting image upload for files:', files);
      console.log('🔄 Files array length:', files.length);
      console.log('🔄 Files array type:', typeof files);
      console.log('🔄 Files is array:', Array.isArray(files));
      
      if (!Array.isArray(files) || files.length === 0) {
        throw new Error('No files provided for upload');
      }
      
      console.log('🔄 File names:', files.map(f => f.name));
      
      let response;
      try {
        response = await uploadApi.multiple(files, 'products');
        console.log('📦 Upload API call successful, response:', response);
      } catch (apiError) {
        console.error('❌ Upload API call failed:', apiError);
        throw apiError;
      }
      
      // Defensive logging
      console.log('📦 Upload response received:', response);
      console.log('📦 Response type:', typeof response);
      console.log('📦 Response is null/undefined:', response === null || response === undefined);
      
      if (response && typeof response === 'object') {
        console.log('📦 Response keys:', Object.keys(response));
      } else {
        console.log('📦 Response is not an object:', response);
      }

      // Check if response exists and has the expected structure
      if (!response) {
        throw new Error('No response received from upload server');
      }

      // Try to get the files array
      let results = null;
      if (response.files && Array.isArray(response.files)) {
        results = response.files;
        console.log('✅ Using response.files:', results);
      } else if (response.results && Array.isArray(response.results)) {
        results = response.results;
        console.log('✅ Using response.results:', results);
      } else {
        console.error('❌ No valid files array found in response:', response);
        throw new Error('Invalid response structure from upload server');
      }

      if (results.length === 0) {
        console.error('❌ Empty results array:', response);
        throw new Error('No files were uploaded');
      }

      console.log('✅ Results is array, mapping results...');
      const uploadResults = results.map((result: any) => {
        console.log('🔄 Mapping result:', result);
        if (!result || !result.imageUrl) {
          console.error('❌ Invalid result object:', result);
          throw new Error('Invalid result object from upload server');
        }
        return {
          imageUrl: result.imageUrl,
          altText: result.originalName || result.altText || 'Uploaded image'
        };
      });
      console.log('✅ Mapped upload results:', uploadResults);

      setUploadedImages(prev => [...prev, ...uploadResults]);
      if (!editingProduct) {
        setHasUnsavedChanges(true);
      }
      return uploadResults;
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw new Error('Failed to upload images');
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    if (!editingProduct) {
      setHasUnsavedChanges(true);
    }
  };

  const restoreSavedData = () => {
    const savedData = loadFormFromStorage();
    if (savedData.formData) {
      setFormData(savedData.formData);
      setHasUnsavedChanges(true);
    }
    if (savedData.features) {
      setFeatures(savedData.features);
    }
    if (savedData.images) {
      setUploadedImages(savedData.images);
    }
    toast({
      title: "Form restored",
      description: "Your saved form data has been restored.",
    });
  };

  const clearSavedData = () => {
    clearFormStorage();
    setHasUnsavedChanges(false);
    toast({
      title: "Saved data cleared",
      description: "All saved form data has been cleared.",
    });
  };

  const handleSubmit = async (isDraft = false) => {
    try {
      setIsSubmitting(true);

      // Validate required fields
      const requiredFields = ['name', 'size', 'brand', 'model', 'speedRating', 'loadIndex', 'seasonType', 'vehicleType', 'price', 'stock'];
      const missingFields = requiredFields.filter(field => {
        const value = formData[field as keyof typeof formData];
        console.log(`🔍 Validating field ${field}:`, value, 'Type:', typeof value);
        return !value || value === '';
      });

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
        // Save specifications as a JSON object
        specifications: {
          speedRating: formData.speedRating || null,
          loadIndex: formData.loadIndex || null,
          seasonType: formData.seasonType || null,
          tireType: formData.vehicleType || null, // Map vehicleType to tireType
          treadDepth: formData.treadDepth || null,
          construction: formData.construction || null,
        },
        // Also keep individual fields for backward compatibility
        speedRating: formData.speedRating,
        loadIndex: formData.loadIndex,
        seasonType: formData.seasonType,
        tireType: formData.vehicleType, // Map vehicleType to tireType
        treadDepth: formData.treadDepth,
        construction: formData.construction,
        // Sale fields
        saleStartDate: formData.saleStartDate || null,
        saleEndDate: formData.saleEndDate || null,
        // SEO fields
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



      console.log('🔄 Submitting product data:', JSON.stringify(productData, null, 2));
      console.log('🚗 Vehicle Type from form:', formData.vehicleType);
      console.log('🚗 Tire Type being sent:', productData.tireType);
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

      // Clear saved form data and reset form if not editing
      if (!editingProduct) {
        clearFormStorage();
        setHasUnsavedChanges(false);
        setFormData({
          brand: '',
          model: '',
          description: '',
          name: '',
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
          categoryIds: [],
          // Sale fields
          saleStartDate: '',
          saleEndDate: ''
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
            {/* Show unsaved changes status */}
            {!editingProduct && hasUnsavedChanges && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-orange-600 font-medium">Unsaved changes</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={restoreSavedData}
                  className="h-6 px-2 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Restore
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSavedData}
                  className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                >
                  Clear
                </Button>
              </div>
            )}
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
                      <SelectItem value="windforce">Windforce</SelectItem>
                      <SelectItem value="headway">Headway</SelectItem>
                      <SelectItem value="dextero">Dextero</SelectItem>
                      <SelectItem value="leao">Leao</SelectItem>
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
                <RichTextEditor
                  key={editingProduct?.id || 'new-product'}
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  placeholder="Describe the tire's features, benefits, and ideal use cases..."
                  uploadImage={async (file) => {
                    try {
                      const response = await uploadApi.single(file, 'descriptions');
                      return response.imageUrl;
                    } catch (error) {
                      console.error('Image upload failed:', error);
                      throw error;
                    }
                  }}
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
                onRemove={removeImage}
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

              <div className="space-y-2">
                <Label htmlFor="saleStartDate">Sale Start Date</Label>
                <Input 
                  id="saleStartDate" 
                  type="datetime-local"
                  value={formData.saleStartDate}
                  onChange={(e) => handleInputChange('saleStartDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="saleEndDate">Sale End Date</Label>
                <Input 
                  id="saleEndDate" 
                  type="datetime-local"
                  value={formData.saleEndDate}
                  onChange={(e) => handleInputChange('saleEndDate', e.target.value)}
                />
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
                <Input 
                  id="metaDescription" 
                  placeholder="Brief description for search engines..." 
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