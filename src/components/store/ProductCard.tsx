import { Star, ShoppingCart, ChevronUp, ChevronDown } from "lucide-react";
import { WishlistButton } from "@/components/store/WishlistButton";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";



export interface ProductCardProps {
  product: {
    id: number;
    name: string;
    brand: string;
    model: string;
    size: string;
    price: string;
    rating: string;
    reviews: number;
    stock: number;
    featured: boolean;
    images?: Array<string | { imageUrl: string }>;
    productImages?: Array<{ imageUrl: string }>;
  };
  onClick?: () => void;
  cartItem?: { quantity: number };
  addToCart?: () => void;
  updateCartQuantity?: (delta: number) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
};

export const ProductCard = ({ product, onClick, cartItem, addToCart, updateCartQuantity, isWishlisted, onToggleWishlist }: ProductCardProps) => {
  let imageUrl = "";
  if (Array.isArray(product.images) && product.images.length > 0) {
    if (typeof product.images[0] === "string") {
      imageUrl = product.images[0];
    } else if (product.images[0] && product.images[0].imageUrl) {
      imageUrl = product.images[0].imageUrl;
    }
  } else if (Array.isArray(product.productImages) && product.productImages.length > 0 && product.productImages[0].imageUrl) {
    imageUrl = product.productImages[0].imageUrl;
  }

  return (
    <div
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden relative w-full max-w-sm mx-auto"
      tabIndex={0}
      aria-label={`Product card for ${product.name}`}
        onClick={onClick}
    >
      {/* Wishlist button (top right) */}
      {typeof isWishlisted !== 'undefined' && onToggleWishlist && (
        <WishlistButton isWishlisted={isWishlisted} onToggle={onToggleWishlist} />
      )}
      <div className="relative">
        <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center overflow-hidden cursor-pointer">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 sm:border-6 md:border-8 border-border bg-white flex items-center justify-center group-hover:border-primary transition-colors duration-300">
              <div className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-primary">{product.size}</div>
            </div>
          )}
        </div>
        {product.featured && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-medium shadow-lg">
              Featured
            </span>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center">
            <span className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-red-50 text-red-700 border border-red-200 font-medium text-xs sm:text-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="p-4 sm:p-6 lg:p-8">
        <h3 className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl mb-2 sm:mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300 cursor-pointer leading-tight">
          {product.name}
        </h3>
        <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base">{product.size}</p>
        <div className="flex items-center mb-4 sm:mb-6 space-x-1 sm:space-x-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 text-amber-400" />
            <span className="ml-1 text-xs sm:text-sm md:text-base font-medium text-gray-900">{parseFloat(product.rating).toFixed(1)}</span>
          </div>
          <span className="text-xs sm:text-sm md:text-base text-gray-500">({product.reviews} reviews)</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-primary">{formatCurrency(product.price)}</span>
          {cartItem && updateCartQuantity ? (
            <div className="flex items-center gap-1 sm:gap-2" data-add-to-cart>
              <Button size="icon" variant="outline" className="rounded-full h-8 w-8 sm:h-10 sm:w-10 border-gray-300" onClick={e => { e.stopPropagation(); updateCartQuantity(1); }} disabled={product.stock === 0} tabIndex={0}>
                <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <span className="font-semibold text-sm sm:text-base min-w-[2ch] text-center">{cartItem.quantity}</span>
              <Button size="icon" variant="outline" className="rounded-full h-8 w-8 sm:h-10 sm:w-10 disabled:cursor-not-allowed border-gray-300" onClick={e => { e.stopPropagation(); updateCartQuantity(-1); }} disabled={product.stock === 0 || cartItem.quantity <= 1} tabIndex={0}>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          ) : addToCart ? (
            <Button size="sm" className="bg-primary hover:bg-accent text-primary-foreground px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm" disabled={product.stock === 0} onClick={e => { e.stopPropagation(); addToCart(); }} data-add-to-cart>
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Add to Cart</span>
              <span className="sm:hidden">Add</span>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
