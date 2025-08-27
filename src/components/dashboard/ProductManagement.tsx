import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Eye, Filter, Loader2 } from "lucide-react";
import { productsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AddProduct } from "./AddProduct";

interface Product {
  id: number;
  name: string;
  brand: string;
  model: string;
  size: string;
  price: string;
  stock: number;
  status: string;
  featured: boolean;
  sku: string;
  slug?: string;
  rating?: string;
  reviews?: number;
  images?: Array<string | { imageUrl: string }>;
  productImages?: Array<{ imageUrl: string }>;
  categoryIds?: number[];
}

export const ProductManagement = () => {
  const [searchType, setSearchType] = useState<'all' | 'brand' | 'model' | 'category'>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<"list" | "add" | "edit">("list");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch products and categories from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsApi.getAll({
          page: 1,
          limit: 50,
          ...(statusFilter !== 'all' && { status: statusFilter }),
          ...(brandFilter !== 'all' && { brand: brandFilter }),
          ...(searchTerm && { search: searchTerm }),
          ...(categoryFilter && { categoryId: categoryFilter }),
        });
        setProducts(response.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    const fetchCategories = async () => {
      try {
        const res = await productsApi.getCategories();
        setCategories(res?.categories || []);
      } catch {
        setCategories([]);
      }
    };
    fetchProducts();
    fetchCategories();
  }, [statusFilter, brandFilter, searchTerm, categoryFilter, toast]);

  // Delete product
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productsApi.delete(productId.toString());
      setProducts(products.filter(p => p.id !== productId));
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Edit product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setCurrentView("edit");
  };

  // View product
  const handleViewProduct = (product: Product) => {
    if (product.slug) {
      navigate(`/products/${product.slug}`);
    } else if (typeof product.id === 'number' && Number.isFinite(product.id)) {
              navigate(`/products/${product.slug || product.id}`);
    } else {
      toast({
        title: "Error",
        description: "Invalid product ID.",
        variant: "destructive",
      });
    }
  };

  // Refresh products after add/edit
  const handleRefreshProducts = () => {
    setCurrentView("list");
    setEditingProduct(null);
    // Trigger a refetch of products
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsApi.getAll({
          page: 1,
          limit: 50,
          ...(statusFilter !== 'all' && { status: statusFilter }),
          ...(brandFilter !== 'all' && { brand: brandFilter }),
          ...(searchTerm && { search: searchTerm }),
        });
        setProducts(response.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'hidden':
        return <Badge variant="outline">Hidden</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stock < 20) {
      return <Badge className="bg-orange-500 hover:bg-orange-600">Low Stock</Badge>;
    }
    return <Badge className="bg-green-500 hover:bg-green-600">In Stock</Badge>;
  };

  const filteredProducts = products.filter(product => {
    let matchesSearch = true;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (searchType === 'brand') {
        matchesSearch = product.brand.toLowerCase().includes(term);
      } else if (searchType === 'model') {
        matchesSearch = product.model.toLowerCase().includes(term);
      } else if (searchType === 'category') {
        matchesSearch = Array.isArray(product.categoryIds) && product.categoryIds.some(catId => {
          const cat = categories.find((c: any) => c.id === catId);
          return cat && cat.name.toLowerCase().includes(term);
        });
      } else {
        matchesSearch = product.brand.toLowerCase().includes(term)
          || product.model.toLowerCase().includes(term)
          || (Array.isArray(product.categoryIds) && product.categoryIds.some(catId => {
            const cat = categories.find((c: any) => c.id === catId);
            return cat && cat.name.toLowerCase().includes(term);
          }));
      }
    }
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesBrand = brandFilter === "all" || product.brand.toLowerCase() === brandFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesBrand;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading products...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show AddProduct component
  if (currentView === "add") {
    return <AddProduct onCancel={() => setCurrentView("list")} onSuccess={handleRefreshProducts} />;
  }

  // Show EditProduct component (using AddProduct with pre-filled data)
  if (currentView === "edit" && editingProduct) {
    return <AddProduct 
      editingProduct={editingProduct} 
      onCancel={() => setCurrentView("list")} 
      onSuccess={handleRefreshProducts} 
    />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Product Management</h2>
          <p className="text-muted-foreground">Manage your tire inventory and listings</p>
        </div>
        <Button className="btn-primary-modern flex items-center space-x-2" onClick={() => setCurrentView("add")}>
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="card-modern">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex gap-2 items-center">
                <div className="search-modern">
                  <Search className="search-icon h-4 w-4" />
                  <Input
                    placeholder={`Search by ${searchType === 'all' ? 'brand, model, or category' : searchType}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-modern pl-12"
                  />
                </div>
                <Select value={searchType} onValueChange={value => setSearchType(value as 'all' | 'brand' | 'model' | 'category')}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Search by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="brand">Brand</SelectItem>
                    <SelectItem value="model">Model</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  <SelectItem value="michelin">Michelin</SelectItem>
                  <SelectItem value="continental">Continental</SelectItem>
                  <SelectItem value="bridgestone">Bridgestone</SelectItem>
                  <SelectItem value="pirelli">Pirelli</SelectItem>
                  <SelectItem value="goodyear">Goodyear</SelectItem>
                  <SelectItem value="testbrand">TestBrand</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="hover:bg-secondary">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found matching your criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          {(() => {
                            let imageUrl = '';
                            if (Array.isArray(product.images) && product.images.length > 0) {
                              if (typeof product.images[0] === 'string') {
                                imageUrl = product.images[0];
                              } else if (product.images[0] && product.images[0].imageUrl) {
                                imageUrl = product.images[0].imageUrl;
                              }
                            } else if (Array.isArray(product.productImages) && product.productImages.length > 0 && product.productImages[0].imageUrl) {
                              imageUrl = product.productImages[0].imageUrl;
                            }
                            if (imageUrl) {
                              return (
                                <img
                                  src={imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-contain"
                                />
                              );
                            } else {
                              return (
                                <div className="w-8 h-8 rounded-full border-2 border-primary bg-primary/10"></div>
                              );
                            }
                          })()}
                        </div>
                        <div>
                          <p className="font-medium text-truncate-2">{product.name}</p>
                          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {Array.isArray(product.categoryIds) && product.categoryIds.length > 0 ? (
                        product.categoryIds.map((catId) => {
                          const cat = categories.find((c: any) => c.id === catId);
                          return cat ? <Badge key={catId} variant="secondary" className="mr-1">{cat.name}</Badge> : null;
                        })
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.size}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">${parseFloat(product.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{product.stock}</p>
                        {getStockStatus(product.stock)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell>
                      {product.featured ? (
                        <Badge className="badge-primary">Featured</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="hover:bg-secondary"
                          onClick={() => handleViewProduct(product)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="hover:bg-secondary"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
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

      {/* Quick Stats */}
      <div className="grid-features gap-6">
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary mb-2">{products.length}</p>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500 mb-2">{products.filter(p => p.status === 'published').length}</p>
              <p className="text-sm text-muted-foreground">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-500 mb-2">{products.filter(p => p.stock < 20 && p.stock > 0).length}</p>
              <p className="text-sm text-muted-foreground">Low Stock</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500 mb-2">{products.filter(p => p.stock === 0).length}</p>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};