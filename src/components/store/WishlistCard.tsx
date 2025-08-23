import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Plus, Minus, Trash2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatEuro } from '@/lib/currency';
import { useTranslation } from 'react-i18next';

interface WishlistCardProps {
  product: any;
  cartItem?: any;
  addToCart: () => void;
  updateCartQuantity: (delta: number) => void;
  onRemoveFromWishlist: () => void;
  onClick: () => void;
}

export const WishlistCard: React.FC<WishlistCardProps> = ({
  product,
  cartItem,
  addToCart,
  updateCartQuantity,
  onRemoveFromWishlist,
  onClick
}) => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Extract all images from product
  const getAllImages = () => {
    const images: string[] = [];
    const seenUrls = new Set<string>();
    
    // Add images from product.images
    if (Array.isArray(product.images)) {
      product.images.forEach((img: any) => {
        const imageUrl = typeof img === "string" ? img : (img && img.imageUrl ? img.imageUrl : null);
        if (imageUrl && !seenUrls.has(imageUrl)) {
          images.push(imageUrl);
          seenUrls.add(imageUrl);
        }
      });
    }
    
    // Add images from product.productImages
    if (Array.isArray(product.productImages)) {
      product.productImages.forEach((img: any) => {
        if (img && img.imageUrl && !seenUrls.has(img.imageUrl)) {
          images.push(img.imageUrl);
          seenUrls.add(img.imageUrl);
        }
      });
    }
    
    return images;
  };

  const images = getAllImages();
  const hasMultipleImages = images.length > 1;

  // Auto-play on hover
  useEffect(() => {
    if (isHovered && hasMultipleImages) {
      autoPlayRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 3000);
    } else if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isHovered, hasMultipleImages, images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextImage();
        } else {
          prevImage();
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const carouselStyles = `
    .product-image-carousel {
      transition: transform 0.3s ease-in-out;
    }
    .navigation-arrow {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .image-dots {
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
    }
    .image-counter {
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
    }
  `;

  return (
    <>
      <style>{carouselStyles}</style>
      <Card 
        className="product-card group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        <CardContent className="p-0">
          {/* Image Section */}
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            <div
              className="w-full h-full bg-gray-100 relative"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={images[currentImageIndex] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-contain bg-gray-50 transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Carousel Controls - Only show when hovering and multiple images */}
              {hasMultipleImages && isHovered && (
                <>
                  {/* Navigation Arrows */}
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 navigation-arrow w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors z-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 navigation-arrow w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors z-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  
                  {/* Dots */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 image-dots px-2 py-1 rounded-full">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => { e.stopPropagation(); goToImage(index); }}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Counter */}
                  <div className="absolute top-2 right-2 image-counter px-2 py-1 rounded-full text-white text-xs font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Remove from Wishlist Button */}
            <Button
              onClick={(e) => { e.stopPropagation(); onRemoveFromWishlist(); }}
              variant="destructive"
              size="sm"
              className="absolute top-2 left-2 z-20 bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="w-4 h-4" />
            </Button>

            {/* Badges */}
            <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
              {product.featured && (
                <Badge className="bg-yellow-500 text-white text-xs">{t('products.featured')}</Badge>
              )}
              {product.discount && (
                <Badge className="bg-red-500 text-white text-xs">-{product.discount}%</Badge>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4">
            {/* Brand and Rating */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{product.brand}</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600">{product.rating || '4.5'}</span>
              </div>
            </div>

            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-bold text-gray-900">
                {formatEuro(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatEuro(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Size */}
            {product.size && (
              <div className="mb-3">
                <span className="text-sm text-gray-600">{t('products.size')}: {product.size}</span>
              </div>
            )}

            {/* Cart Actions */}
            <div className="flex gap-2">
              {cartItem ? (
                <div className="flex items-center gap-2 flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); updateCartQuantity(-1); }}
                    className="w-8 h-8 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-medium min-w-[2rem] text-center">
                    {cartItem.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); updateCartQuantity(1); }}
                    className="w-8 h-8 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={(e) => { e.stopPropagation(); addToCart(); }}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">{t('products.addCart')}</span>
                  <span className="hidden sm:inline md:hidden">Cart</span>
                  <span className="sm:hidden">+</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
