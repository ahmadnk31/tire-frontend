import React, { useState, useEffect } from 'react';
import { 
  fetchCampaigns, 
  createCampaign, 
  sendCampaign, 
  deleteCampaign, 
  getCampaign,
  NewsletterCampaign,
  CreateCampaignData,
  getNewsletterSubscriptions,
  NewsletterSubscription
} from '../../lib/api/dashboard';
import { productsApi } from '../../lib/api';
import { 
  Plus, 
  Send, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Users, 
  TrendingUp, 
  Package,
  Mail,
  X,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Product {
  id: number;
  name: string;
  brand: string;
  model: string;
  size: string;
  price: string;
  comparePrice?: string;
  images?: string[];
  stock: number;
}

const CampaignManagement: React.FC = () => {
  const token = localStorage.getItem('token') || '';
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [campaignToSend, setCampaignToSend] = useState<NewsletterCampaign | null>(null);
  const [subscriberFilter, setSubscriberFilter] = useState('all');
  
  // Form states
  const [formData, setFormData] = useState<CreateCampaignData>({
    title: '',
    subject: '',
    content: '',
    type: 'general',
    productIds: [],
  });
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productsLoading, setProductsLoading] = useState(false);

  // Load campaigns
  const loadCampaigns = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetchCampaigns(
        token, 
        currentPage, 
        20, 
        statusFilter, 
        typeFilter
      );
      
      if (response.success && response.data) {
        setCampaigns(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalCampaigns(response.pagination.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  // Load products for selection
  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      console.log('🔄 Loading products for campaign...');
      const response = await productsApi.getAll({ 
        limit: 100, // Get more products
        status: 'published' // Only get published products
      });
      
      console.log('📦 Full API response:', response);
      console.log('📦 Response type:', typeof response);
      console.log('📦 Response.products:', response.products);
      
      // The API returns the data directly (not wrapped in {success, data})
      if (response && response.products) {
        const productsArray = response.products;
        console.log('📦 Products array:', productsArray);
        console.log('📦 Is array?', Array.isArray(productsArray));
        console.log('📦 Array length:', productsArray?.length);
        
        if (Array.isArray(productsArray) && productsArray.length > 0) {
          // Transform the products to match our interface
          const transformedProducts = productsArray.map(product => ({
            id: product.id,
            name: product.name,
            brand: product.brand,
            model: product.model,
            size: product.size,
            price: product.price,
            comparePrice: product.comparePrice,
            stock: product.stock,
          }));
          console.log('✅ Transformed products:', transformedProducts);
          console.log('✅ About to set products state with', transformedProducts.length, 'products');
          setProducts(transformedProducts);
          console.log('✅ setProducts called successfully');
        } else {
          console.warn('⚠️ No products found in response or not an array');
          console.warn('⚠️ Products array:', productsArray);
          setProducts([]);
        }
      } else {
        console.warn('❌ Invalid response structure');
        console.warn('❌ Response:', response);
        setProducts([]);
      }
    } catch (err) {
      console.error('❌ Failed to load products:', err);
      console.error('❌ Error details:', err.message, err.stack);
      setError('Failed to load products for selection');
      // Set empty array if API fails
      setProducts([]);
    } finally {
      console.log('🏁 Setting products loading to false');
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [currentPage, statusFilter, typeFilter, token]);

  // Products will be loaded on demand when the product selector is opened

  // Create campaign
  const handleCreateCampaign = async () => {
    console.log('🚀 Creating campaign...');
    console.log('📋 Form data:', formData);
    console.log('🎯 Selected products:', selectedProducts);
    console.log('🔑 Token available:', !!token);
    console.log('🔑 Token value:', token ? token.substring(0, 20) + '...' : 'null');
    
    if (!token) {
      console.error('❌ No token available');
      setError('Authentication token not found. Please log in again.');
      return;
    }
    
    try {
      const campaignData = {
        ...formData,
        productIds: formData.type === 'product_catalog' ? selectedProducts.map(p => p.id) : undefined,
      };
      
      console.log('📤 Sending campaign data:', campaignData);
      
      const response = await createCampaign(token, campaignData);
      console.log('✅ Campaign created successfully:', response);
      
      // Reset form
      setFormData({
        title: '',
        subject: '',
        content: '',
        type: 'general',
        productIds: [],
      });
      setSelectedProducts([]);
      setShowCreateModal(false);
      
      // Reload campaigns
      loadCampaigns();
    } catch (err) {
      console.error('❌ Campaign creation failed:', err);
      console.error('❌ Error details:', err.message);
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    }
  };

  // Send campaign
  const handleSendCampaign = async (campaign: NewsletterCampaign) => {
    setCampaignToSend(campaign);
    setSubscriberFilter('all');
    setShowSendModal(true);
  };

  const confirmSendCampaign = async () => {
    if (!token || !campaignToSend) return;
    
    try {
      await sendCampaign(token, campaignToSend.id, subscriberFilter);
      setShowSendModal(false);
      setCampaignToSend(null);
      loadCampaigns(); // Reload to see updated status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send campaign');
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (campaignId: number) => {
    if (!token) return;
    
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteCampaign(token, campaignId);
      loadCampaigns(); // Reload campaigns
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
    }
  };

  // Filter products for selection
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.model.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  // Add product to selection
  const addProduct = (product: Product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  // Remove product from selection
  const removeProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Campaigns</h1>
          <p className="text-gray-600">Create and manage email marketing campaigns</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Mail className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Campaigns</p>
              <p className="text-lg font-semibold text-gray-900">{totalCampaigns}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Send className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Sent</p>
              <p className="text-lg font-semibold text-gray-900">
                {campaigns.filter(c => c.status === 'sent').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Edit className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Draft</p>
              <p className="text-lg font-semibold text-gray-900">
                {campaigns.filter(c => c.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Product Catalogs</p>
              <p className="text-lg font-semibold text-gray-900">
                {campaigns.filter(c => c.type === 'product_catalog').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="product_catalog">Product Catalog</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setError(null)}
            className="mt-2"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{campaign.title}</p>
                      <p className="text-sm text-gray-500">{campaign.subject}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={campaign.type === 'product_catalog' ? 'secondary' : 'default'}>
                      {campaign.type === 'product_catalog' ? 'Product Catalog' : 
                       campaign.type === 'promotional' ? 'Promotional' : 'General'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      campaign.status === 'sent' ? 'default' :
                      campaign.status === 'draft' ? 'secondary' :
                      campaign.status === 'cancelled' ? 'destructive' : 'default'
                    }>
                      {campaign.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900">{campaign.recipientCount}</p>
                      {campaign.openCount > 0 && (
                        <p className="text-gray-500">{campaign.openCount} opens</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {campaign.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => handleSendCampaign(campaign)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Campaign Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter campaign title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email Subject</label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject line"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Campaign Type</label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Newsletter</SelectItem>
                  <SelectItem value="product_catalog">Product Catalog</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'product_catalog' && (
              <div>
                <label className="block text-sm font-medium mb-1">Products</label>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowProductSelector(true);
                    // Always load products when opening the modal to ensure fresh data
                    loadProducts();
                  }}
                  className="w-full"
                  disabled={productsLoading}
                >
                  <Package className="h-4 w-4 mr-2" />
                  {productsLoading ? 'Loading Products...' : `Select Products (${selectedProducts.length} selected)`}
                </Button>
                {selectedProducts.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedProducts.map(product => (
                      <Badge key={product.id} variant="secondary">
                        {product.name}
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={() => removeProduct(product.id)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder={formData.type === 'product_catalog' 
                  ? "This content will be shown above the product catalog. The selected products will be automatically displayed below."
                  : "Enter your email content"
                }
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign}>
                Create Campaign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Selector Modal */}
      <Dialog open={showProductSelector} onOpenChange={setShowProductSelector}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Products</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Search products..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {(() => {
                console.log('🎭 Rendering product selector - Products:', products.length);
                console.log('🎭 Products loading:', productsLoading);
                console.log('🎭 Filtered products:', filteredProducts.length);
                console.log('🎭 Products state:', products);
                console.log('🎭 Product search term:', productSearchTerm);
                return null;
              })()}
              {productsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Loading products...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    {products.length === 0 ? 'No products available' : 'No products match your search'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Total products: {products.length}, Filtered: {filteredProducts.length}
                  </p>
                  {products.length === 0 && (
                    <Button
                      variant="outline"
                      onClick={loadProducts}
                      className="mt-2"
                    >
                      Retry Loading Products
                    </Button>
                  )}
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.brand} {product.model} - ${product.price}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={selectedProducts.find(p => p.id === product.id) ? "secondary" : "outline"}
                      onClick={() => selectedProducts.find(p => p.id === product.id) 
                        ? removeProduct(product.id) 
                        : addProduct(product)
                      }
                    >
                      {selectedProducts.find(p => p.id === product.id) ? 'Remove' : 'Add'}
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setShowProductSelector(false)}>
                Done ({selectedProducts.length} selected)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Campaign Modal */}
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {campaignToSend && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">{campaignToSend.title}</h3>
                <p className="text-sm text-gray-600">{campaignToSend.subject}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Type: {campaignToSend.type === 'product_catalog' ? 'Product Catalog' : 'General'}
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Recipients
              </label>
              <Select value={subscriberFilter} onValueChange={setSubscriberFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose recipient group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Active Subscribers</SelectItem>
                  <SelectItem value="website">Website Subscribers</SelectItem>
                  <SelectItem value="newsletter">Newsletter Subscribers</SelectItem>
                  <SelectItem value="contact">Contact Form Subscribers</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Choose which group of subscribers should receive this campaign
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSendModal(false);
                  setCampaignToSend(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={confirmSendCampaign}>
                <Send className="h-4 w-4 mr-2" />
                Send Campaign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignManagement;
