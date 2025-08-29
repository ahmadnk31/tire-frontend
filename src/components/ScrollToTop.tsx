import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Don't scroll to top if there's a hash in the URL (anchor links)
    if (hash) {
      return;
    }

    // Scroll to top when pathname changes
    // Use smooth scrolling for better UX
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname, hash]);

  return null;
};
