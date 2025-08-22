import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Play, Pause } from 'lucide-react';
import { Button } from './button';

interface ImageCarouselProps {
  images: string[];
  altText?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showDots?: boolean;
  showCounter?: boolean;
  showFullscreen?: boolean;
  onImageChange?: (index: number) => void;
  className?: string;
  imageClassName?: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  altText = 'Product image',
  autoPlay = false,
  autoPlayInterval = 3000,
  showControls = true,
  showDots = true,
  showCounter = true,
  showFullscreen = false,
  onImageChange,
  className = '',
  imageClassName = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && images.length > 1) {
      const interval = setInterval(nextImage, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [isPlaying, autoPlayInterval, nextImage, images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prevImage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextImage();
          break;
        case ' ':
          event.preventDefault();
          togglePlay();
          break;
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          }
          break;
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [prevImage, nextImage, togglePlay, isFullscreen]);

  // Call onImageChange callback
  useEffect(() => {
    onImageChange?.(currentIndex);
  }, [currentIndex, onImageChange]);

  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-gray-500">No images available</div>
      </div>
    );
  }

  const carouselContent = (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Main Image */}
      <div className="relative">
        <img
          src={images[currentIndex]}
          alt={`${altText} ${currentIndex + 1}`}
          className={`w-full h-full object-contain transition-all duration-500 ease-in-out ${imageClassName}`}
        />
        
        {/* Navigation Arrows */}
        {showControls && images.length > 1 && (
          <>
            <Button
              size="icon"
              variant="secondary"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={prevImage}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={nextImage}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {/* Control Buttons */}
        <div className="absolute top-2 right-2 flex gap-2">
          {autoPlay && images.length > 1 && (
            <Button
              size="icon"
              variant="secondary"
              className="bg-white/80 hover:bg-white shadow-md rounded-full h-8 w-8"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          )}
          
          {showFullscreen && (
            <Button
              size="icon"
              variant="secondary"
              className="bg-white/80 hover:bg-white shadow-md rounded-full h-8 w-8"
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Image Counter */}
        {showCounter && images.length > 1 && (
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
      
      {/* Dots Navigation */}
      {showDots && images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-primary scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/20 to-transparent p-2">
          <div className="flex space-x-1 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-12 h-12 rounded border-2 transition-all duration-200 ${
                  index === currentIndex 
                    ? 'border-primary' 
                    : 'border-white/50 hover:border-white'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-4 right-4 bg-white/80 hover:bg-white shadow-md rounded-full h-10 w-10"
            onClick={toggleFullscreen}
            aria-label="Close fullscreen"
          >
            <X className="h-6 w-6" />
          </Button>
          {carouselContent}
        </div>
      </div>
    );
  }

  return carouselContent;
};
