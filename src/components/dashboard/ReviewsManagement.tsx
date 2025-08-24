import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star, 
  User, 
  Calendar,
  Eye,
  Trash2
} from "lucide-react";
import { format } from "date-fns";

export const ReviewsManagement = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  // Fetch pending reviews
  const { data: pendingReviewsData, isLoading: pendingLoading } = useQuery({
    queryKey: ["admin-reviews", "pending"],
    queryFn: () => reviewsApi.getPendingReviews(token),
    enabled: !!token,
  });

  // Fetch all reviews for overview
  const { data: allReviewsData, isLoading: allLoading } = useQuery({
    queryKey: ["admin-reviews", "all"],
    queryFn: () => reviewsApi.getAllReviews(token),
    enabled: !!token,
  });

  // Extract reviews arrays from API responses
  const pendingReviews = pendingReviewsData?.reviews || [];
  const allReviews = allReviewsData?.reviews || [];

  // Debug API responses
  console.log('🔍 [ReviewsManagement] API Responses:', {
    pendingReviewsData,
    allReviewsData,
    pendingReviews,
    allReviews
  });



  // Update review status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ reviewId, status }: { reviewId: number; status: string }) =>
      reviewsApi.updateReviewStatus(reviewId, status, token),
    onSuccess: () => {
      toast({
        title: "Review Updated",
        description: "Review status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update review status.",
        variant: "destructive",
      });
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => reviewsApi.deleteReview(reviewId, token),
    onSuccess: () => {
      toast({
        title: "Review Deleted",
        description: "Review has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review.",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (reviewId: number, status: string) => {
    updateStatusMutation.mutate({ reviewId, status });
  };

  const handleDeleteReview = (reviewId: number) => {
    if (confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-orange-100 text-orange-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderReviewCard = (review: any) => {
    console.log('🔍 [ReviewsManagement] Review data:', {
      id: review.id,
      productId: review.productId,
      product: review.product,
      status: review.status
    });
    
    return (
      <Card key={review.id} className="mb-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {renderStars(review.rating)}
                <span className="text-sm text-gray-600">({review.rating}/5)</span>
              </div>
              {getStatusBadge(review.status)}
            </div>
            <div className="flex items-center gap-2">
              {review.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                    onClick={() => handleStatusUpdate(review.id, "approved")}
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => handleStatusUpdate(review.id, "rejected")}
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => handleDeleteReview(review.id)}
                disabled={deleteReviewMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Product Information */}
          <div className="bg-gray-50 p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                {review.product ? (
                  <>
                    <h4 className="font-semibold text-gray-900">
                      {review.product.brand} {review.product.name}
                    </h4>
                    <p className="text-sm text-gray-600">Product ID: {review.productId || 'Unknown'}</p>
                  </>
                ) : (
                  <>
                    <h4 className="font-semibold text-gray-900">Product Not Found</h4>
                    <p className="text-sm text-gray-600">Product ID: {review.productId || 'Unknown'}</p>
                  </>
                )}
              </div>
              {review.productId && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  onClick={() => window.open(`/products/${review.productId}`, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Product
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{review.user?.name || "Anonymous"}</span>
            <Calendar className="w-4 h-4 ml-2" />
            <span>{format(new Date(review.createdAt), "MMM dd, yyyy")}</span>
          </div>
          
          {review.title && (
            <h4 className="font-semibold text-lg">{review.title}</h4>
          )}
          
          {review.comment && (
            <p className="text-gray-700">{review.comment}</p>
          )}
          
          {review.images && Array.isArray(review.images) && review.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {review.images.map((image: string, index: number) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {review.isVerifiedPurchase && (
              <Badge variant="outline" className="text-green-600">
                Verified Purchase
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  };

  if (pendingLoading || allLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Loading reviews...</p>
        </div>
      </div>
    );
  }

  // Handle error states
  if (!Array.isArray(pendingReviews) || !Array.isArray(allReviews)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MessageSquare className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-500">Error loading reviews. Please try again.</p>
          <p className="text-sm text-gray-500 mt-2">
            {JSON.stringify({ pendingReviews, allReviews })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reviews Management</h2>
          <p className="text-gray-600">Manage and moderate product reviews</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending
            {Array.isArray(pendingReviews) && pendingReviews.length > 0 && (
              <Badge variant="secondary">{pendingReviews.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {!Array.isArray(pendingReviews) || pendingReviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Reviews</h3>
                <p className="text-gray-600">All reviews have been processed.</p>
              </CardContent>
            </Card>
          ) : (
            pendingReviews.map(renderReviewCard)
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {!Array.isArray(allReviews) || allReviews.filter((r: any) => r.status === "approved").length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Approved Reviews</h3>
                <p className="text-gray-600">No reviews have been approved yet.</p>
              </CardContent>
            </Card>
          ) : (
            allReviews.filter((r: any) => r.status === "approved").map(renderReviewCard)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {!Array.isArray(allReviews) || allReviews.filter((r: any) => r.status === "rejected").length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Rejected Reviews</h3>
                <p className="text-gray-600">No reviews have been rejected.</p>
              </CardContent>
            </Card>
          ) : (
            allReviews.filter((r: any) => r.status === "rejected").map(renderReviewCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
