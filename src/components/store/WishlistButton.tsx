import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

interface WishlistButtonProps {
  isWishlisted: boolean;
  onToggle: () => void;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({ isWishlisted, onToggle }) => {
  // Check if user is logged in (localStorage token)
  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('token');
  if (!isLoggedIn) return null;
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className="absolute top-4 right-4 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-primary/10 transition-colors"
      onClick={e => { e.stopPropagation(); onToggle(); }}
    >
      <Heart className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
    </Button>
  );
};
