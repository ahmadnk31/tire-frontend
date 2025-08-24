import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { bannersApi } from "@/lib/bannersApi";
import { MediaPlayer, MediaProvider, Poster } from "@vidstack/react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { HeroCarouselSkeleton } from "@/components/ui/skeletons";
import { ChevronLeft, ChevronRight, Play, ArrowRight, Pause, Maximize2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Extend the Window interface to include __carouselTouchStartX
declare global {
  interface Window {
    __carouselTouchStartX?: number;
  }
}

// Video styling to ensure proper sizing
const videoStyles = `
  .hero-video-player {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    object-position: center !important;
  }
  
  .hero-video-player video {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    object-position: center !important;
  }
  
  .hero-video-player .vds-poster {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    object-position: center !important;
  }
`;

const defaultBanner = {
  type: "image",
  src: "https://www.giosg.com/hubfs/1-2.png",
  headline: "Limited Time Offer! Up to 50% OFF!",
  subheadline: "#Big Fashion Sale",
  description: "Redefine Your Everyday Style",
};

export function HeroCarousel() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: ["banners"],
    queryFn: () => bannersApi.getAll(),
  });
  const banners = data?.banners || [];
  const slides = banners.length > 0 ? banners : [defaultBanner];
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Video play state for media section
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoPlayerRef = useRef<any>(null);
  const navigate = useNavigate();

  // CTA handlers for banner buttons
  const handlePrimaryCTA = () => {
    const slide = slides[current] as any;
    const url = slide?.ctaUrl || slide?.url || slide?.link || slide?.target;
    if (url) {
      if (/^https?:\/\//.test(url)) {
        window.location.href = url;
      } else {
        navigate(url);
      }
    } else {
      navigate('/products');
    }
  };

  const handleSecondaryCTA = () => {
    const slide = slides[current] as any;
    const url = slide?.secondaryUrl || slide?.learnMoreUrl || slide?.url || slide?.link;
    if (url) {
      if (/^https?:\/\//.test(url)) {
        window.location.href = url;
      } else {
        navigate(url);
      }
    } else {
      navigate('/about');
    }
  };

  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, slides.length, isHovered]);
console.log('HeroCarousel rendered with slides:', banners);
  if (isLoading) {
    return <HeroCarouselSkeleton />;
  }

  if (error) {
    return (
  <div className="relative w-full h-screen bg-gradient-to-br from-destructive to-destructive/70 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">{t('banner.loadError')}</div>
          <div className="text-destructive-foreground/80">{t('banner.tryAgain')}</div>
        </div>
      </div>
    );
  }

  const currentSlide = slides[current];

  return (
    <div 
      className="relative w-full h-screen overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={(e) => {
        if (e.touches.length === 1) {
          window.__carouselTouchStartX = e.touches[0].clientX;
        }
      }}
      onTouchEnd={(e) => {
        if (typeof window.__carouselTouchStartX !== 'number') return;
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - window.__carouselTouchStartX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
          } else {
            setCurrent((prev) => (prev + 1) % slides.length);
          }
        }
        window.__carouselTouchStartX = undefined;
      }}
    >
      {/* Video Styles */}
      <style dangerouslySetInnerHTML={{ __html: videoStyles }} />

      {/* Main Content */}
      {/* Media Content with fade overlay above image/video */}
      <div className="absolute inset-0 z-0">
        {/* Image or Video as background */}
        {currentSlide.type === "image" ? (
          <img
            src={currentSlide.src && currentSlide.src.trim() !== '' ? currentSlide.src : "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop"}
            alt={currentSlide.headline}
            className="object-cover w-full h-full"
            style={{ objectPosition: 'center' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop";
            }}
          />
        ) : (
          <div className="relative w-full h-full">
            <MediaPlayer
              ref={videoPlayerRef}
              src={currentSlide.src}
              autoPlay
              loop
              muted
              playsInline
              className="hero-video-player w-full h-full"
              style={{ 
                objectFit: 'cover',
                objectPosition: 'center',
                width: '100%',
                height: '100%'
              }}
              controls={false}
              onPause={() => setIsVideoPlaying(false)}
              onPlay={() => setIsVideoPlaying(true)}
            >
              <MediaProvider />
              {currentSlide.poster && (
                <Poster 
                  src={currentSlide.poster} 
                  alt={currentSlide.headline}
                  className="w-full h-full object-cover"
                />
              )}
            </MediaPlayer>
          </div>
        )}
  {/* Slightly stronger fade overlay for more contrast */}
  <div className="absolute inset-0 bg-black/50 pointer-events-none" />
  
  {/* Play/Pause Button for video - positioned outside overlay */}

      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-4 sm:space-y-6 text-white">
              {currentSlide.subheadline && (
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-accent rounded-full animate-pulse" />
                  <span className="text-xs sm:text-sm font-medium text-accent-foreground">{currentSlide.subheadline}</span>
                </div>
              )}
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold leading-tight bg-gradient-to-r from-white via-accent-foreground to-white bg-clip-text text-transparent animate-fade-in">
                {currentSlide.headline}
              </h1>
              
              {currentSlide.description && (
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 max-w-lg leading-relaxed animate-fade-in-delay">
                  {currentSlide.description}
                </p>
              )}
              
              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in-delay-2 relative z-[600]">
                <Button 
                  size="lg" 
                  type="button"
                  className="bg-primary px-4 sm:px-6 py-2 sm:py-3 relative z-10 hover:bg-primary/90 text-primary-foreground font-semibold text-sm md:text-lg shadow-2xl shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-primary/40 pointer-events-auto"
                  onClick={handlePrimaryCTA}
                >
                  {t('banner.shopNow')}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  type="button"
                  className="border-white/30 text-primary hover:bg-white/10 font-semibold text-sm md:text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 pointer-events-auto px-4 sm:px-6 py-2 sm:py-3"
                  onClick={handleSecondaryCTA}
                >
                  {t('banner.learnMore')}
                </Button>
              </div>
            </div>

            {/* Media Content - Hidden on small screens */}
            <div className="hidden lg:flex justify-center lg:justify-end">
              <div className="relative group/media">
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent blur-2xl opacity-20 group-hover/media:opacity-30 transition-opacity duration-500 pointer-events-none" />
                
                <AspectRatio ratio={16 / 9} className="relative max-w-[500px] w-full bg-black/20 backdrop-blur-sm overflow-hidden border border-white/10 shadow-2xl">
                  {currentSlide.type === "image" ? (
                    <img
                      src={currentSlide.src && currentSlide.src.trim() !== '' ? currentSlide.src : "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop"}
                      alt={currentSlide.headline}
                      className="object-cover w-full h-full transition-all duration-700 group-hover/media:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop";
                      }}
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <MediaPlayer
                        src={currentSlide.src}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="hero-video-player w-full h-full"
                        style={{ 
                          objectFit: 'cover',
                          objectPosition: 'center',
                          width: '100%',
                          height: '100%'
                        }}
                        controls={false}
                      >
                        <MediaProvider />
                        {currentSlide.poster && (
                          <Poster 
                            src={currentSlide.poster} 
                            alt={currentSlide.headline}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </MediaPlayer>
                      {/* Video Play Indicator */}
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                  )}
                </AspectRatio>
              </div>
            </div>
          </div>
        </div>
      </div>

  {/* Video Controls */}
  {currentSlide.type === "video" && (
    <>
      {/* Play/Pause Button */}
      <button
        className="absolute bottom-4 left-4 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 sm:p-3 shadow-lg transition pointer-events-auto"
        onClick={() => {
          const player = videoPlayerRef.current;
          if (player) {
            if (isVideoPlaying) {
              player.pause();
            } else {
              player.play();
            }
          }
        }}
        aria-label={isVideoPlaying ? t('banner.pauseVideo') : t('banner.playVideo')}
        type="button"
      >
        {isVideoPlaying ? <Pause className="w-4 h-4 sm:w-6 sm:h-6" /> : <Play className="w-4 h-4 sm:w-6 sm:h-6" />}
      </button>
      
      {/* Fullscreen Button */}
      <button
        className="absolute bottom-4 left-16 sm:left-20 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 sm:p-3 shadow-lg transition pointer-events-auto"
        onClick={() => {
          const player = videoPlayerRef.current;
          if (player && player.requestFullscreen) {
            player.requestFullscreen();
            setIsFullscreen(true);
          }
        }}
        aria-label={t('banner.fullscreenVideo')}
        type="button"
      >
        <Maximize2 className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>
    </>
  )}
      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
          {/* Chevron Buttons at bottom right, horizontal alignment */}
          <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 flex flex-col sm:flex-row gap-2 sm:gap-4 z-20">
            <Button
              variant="outline"
              size="icon"
              type="button"
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm rounded-full w-8 h-8 sm:w-9 sm:h-9 md:w-12 md:h-12 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-110"
              onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
              aria-label={t('banner.previousSlide')}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              type="button"
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm rounded-full w-8 h-8 sm:w-9 sm:h-9 md:w-12 md:h-12 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-110"
              onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
              aria-label={t('banner.nextSlide')}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </Button>
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`transition-all duration-300 rounded-full ${
                  idx === current 
                    ? "w-6 sm:w-8 h-2 sm:h-3 bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/50" 
                    : "w-2 sm:w-3 h-2 sm:h-3 bg-white/30 hover:bg-white/50 hover:scale-110"
                }`}
                onClick={() => setCurrent(idx)}
                aria-label={t('banner.goToSlide', { number: idx + 1 })}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-linear"
              style={{ 
                width: `${((current + 1) / slides.length) * 100}%`,
              }}
            />
          </div>
        </>
      )}

    
    </div>
  );
}