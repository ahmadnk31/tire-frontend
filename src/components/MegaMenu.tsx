import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { productsApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export function MegaMenu() {
  const { t } = useTranslation();
  const [active, setActive] = useState<string | null>(null);
  const [navHeight, setNavHeight] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; slug: string }>>([]);
  const important = [
    t('megaMenu.offers'), 
    t('megaMenu.newArrivals'), 
    t('megaMenu.bestSellers'), 
    t('megaMenu.support')
  ];
  const [relatedParts, setRelatedParts] = useState<Record<string, string[]>>({});
  const navigate = useNavigate();

  // Measure full header height (including top bar) and update on resize
  useEffect(() => {
    const updateNavHeight = () => {
      const header = document.querySelector('header');
      if (header) {
        // For fixed header, we need to account for the header's height
        // Check if header is visible (not translated out of view)
        const transform = window.getComputedStyle(header).transform;
        const isHeaderVisible = transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)';
        
        if (isHeaderVisible) {
          const headerHeight = header.offsetHeight;
          setNavHeight(headerHeight);
        } else {
          // Header is hidden, position mega menu at top
          setNavHeight(0);
        }
      } else if (navRef.current) {
        // fallback to old behavior
        const rect = navRef.current.getBoundingClientRect();
        setNavHeight(rect.bottom);
      }
    };
    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    // Also listen for scroll events to update positioning when header visibility changes
    window.addEventListener('scroll', updateNavHeight);
    return () => {
      window.removeEventListener('resize', updateNavHeight);
      window.removeEventListener('scroll', updateNavHeight);
    };
  }, []);

  // Fetch brands/models/categories from backend
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await productsApi.getAll({ limit: 100 });
        setBrands(res.filters?.brands || []);
        // Extract models and relatedParts from products
        const products = res.products || [];
        setModels(Array.from(new Set(products.map((p: any) => p.model))) as string[]);
        setSizes(Array.from(new Set(products.map((p: any) => p.size))) as string[]);
        // Related parts: group by brand
        const parts: Record<string, string[]> = {};
        products.forEach((p: any) => {
          if (!parts[p.brand]) parts[p.brand] = [];
          if (p.model && !parts[p.brand].includes(p.model)) parts[p.brand].push(p.model);
        });
        setRelatedParts(parts);
        // Fetch categories from backend
        const catRes = await productsApi.getCategories();
        setCategories(catRes.categories ? catRes.categories.map((c: any) => ({ name: c.name, slug: c.slug })) : []);
      } catch (err) {
        setBrands([]);
        setModels([]);
        setSizes([]);
        setCategories([]);
        setRelatedParts({});
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleTriggerEnter = (menuType: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActive(menuType);
  };

  const handleTriggerLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActive(null);
    }, 150);
  };

  const handleDropdownEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleDropdownLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActive(null);
    }, 150);
  };

  // Filtering and URL update
  const handleFilterClick = (type: string, value: string) => {
    // Handle important links differently
    if (type === "important") {
      switch (value) {
        case t('megaMenu.offers'):
          navigate('/sale');
          break;
        case t('megaMenu.newArrivals'):
          navigate('/new-arrivals');
          break;
        case t('megaMenu.bestSellers'):
          navigate('/products?featured=true');
          break;
        case t('megaMenu.support'):
          navigate('/contact');
          break;
        default:
          break;
      }
      setActive(null);
      return;
    }

    // Read current params from URL
    const currentParams = new URLSearchParams(window.location.search);
    if (type === "brands") {
      currentParams.set("brand", value);
      currentParams.delete("model");
      currentParams.delete("size");
      currentParams.delete("category");
    } else if (type === "models") {
      currentParams.set("model", value);
    } else if (type === "sizes") {
      currentParams.set("size", value);
    } else if (type === "categories") {
      currentParams.set("category", value);
    }
    // Remove 'all' values
    ["brand", "model", "size"].forEach(key => {
      if (currentParams.get(key) === "all") currentParams.delete(key);
    });
    const url = `/products${currentParams.toString() ? `?${currentParams.toString()}` : ""}`;
    navigate(url);
    setActive(null);
  };

  const renderDropdownContent = () => {
  const currentItems = active === "brands" ? brands : 
            active === "models" ? models : 
            active === "sizes" ? sizes : 
            active === "categories" ? categories : important;

    return (
      <div className="bg-white shadow-2xl border-t border-gray-200 min-h-[400px] md:min-h-[350px]">
        {/* Mobile layout */}
        <div className="block md:hidden p-4">
          <h3 className="font-bold mb-4 text-lg border-b border-gray-200 pb-2">
            {active?.charAt(0).toUpperCase() + active?.slice(1)}
          </h3>
          <div className="space-y-6">
            {currentItems.map((item) => (
              <div key={typeof item === 'string' ? item : item.name} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="font-semibold mb-3 text-base cursor-pointer" onClick={() => handleFilterClick(active!, typeof item === 'string' ? item : item.slug)}>
                  {typeof item === 'string' ? item.toUpperCase() : item.name.toUpperCase()}
                </div>
                <ul className="space-y-2 pl-4">
                  {(active === "brands" && relatedParts[typeof item === 'string' ? item : item.name] && relatedParts[typeof item === 'string' ? item : item.name].length > 0) ? 
                    relatedParts[typeof item === 'string' ? item : item.name].map((part) => (
                      <li key={part} className="text-gray-700 hover:text-primary-600 cursor-pointer text-sm" onClick={() => handleFilterClick("models", part)}>
                        {part}
                      </li>
                    )) : (
                      <li className="text-gray-400 italic text-sm">{t('megaMenu.noRelatedParts')}</li>
                    )
                  }
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:flex w-full h-full">
          <div className="w-1/4 p-8 border-r border-gray-100 bg-gray-50">
            <h3 className="font-bold mb-6 text-lg text-gray-900">
              {active?.charAt(0).toUpperCase() + active?.slice(1)}
            </h3>
            <ul className="space-y-3">
              {currentItems.map((item) => (
                <li key={typeof item === 'string' ? item : item.name} className="text-gray-700 hover:text-primary-600 hover:underline cursor-pointer transition-colors" onClick={() => handleFilterClick(active!, typeof item === 'string' ? item : item.slug)}>
                  {typeof item === 'string' ? item.toUpperCase() : item.name.toUpperCase()}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 p-8">
            {active === "important" ? (
              <div className="space-y-4">
                <h3 className="font-bold mb-6 text-lg text-gray-900">Quick Links</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {currentItems.map((item) => (
                    <div key={item} className="space-y-3">
                      <div className="font-semibold text-gray-900 cursor-pointer hover:text-primary-600 hover:underline transition-colors" onClick={() => handleFilterClick(active!, item)}>
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-bold mb-6 text-lg text-gray-900">{t('megaMenu.relatedParts')}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {currentItems.map((item) => (
                    <div key={typeof item === 'string' ? item : item.name} className="space-y-3">
                      <div className="font-semibold text-gray-900 cursor-pointer" onClick={() => handleFilterClick(active!, typeof item === 'string' ? item : item.slug)}>
                        {typeof item === 'string' ? item.toUpperCase() : item.name.toUpperCase()}
                      </div>
                      <ul className="space-y-2">
                        {(active === "brands" && relatedParts[typeof item === 'string' ? item : item.name] && relatedParts[typeof item === 'string' ? item : item.name].length > 0) ? 
                          relatedParts[typeof item === 'string' ? item : item.name].map((part) => (
                            <li key={part} className="text-gray-700 hover:text-primary-600 hover:underline cursor-pointer transition-colors text-sm" onClick={() => handleFilterClick("models", part)}>
                              {part}
                            </li>
                          )) : (
                            <li className="text-gray-400 italic text-sm">{t('megaMenu.noRelatedParts')}</li>
                          )
                        }
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full">
      {/* Navigation Bar */}
      <div ref={navRef} className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <NavigationMenu className="w-full">
            <NavigationMenuList className="w-full justify-center space-x-1 md:space-x-4">
              {/* Brands */}
              <NavigationMenuItem className="pl-0">
                <NavigationMenuTrigger
                  className=" py-3 hover:text-primary-600 transition-colors bg-transparent hover:bg-transparent data-[state=open]:bg-transparent"
                  onMouseEnter={() => handleTriggerEnter("brands")}
                  onMouseLeave={handleTriggerLeave}
                >
                  {t('megaMenu.brands')}
                </NavigationMenuTrigger>
              </NavigationMenuItem>

              {/* Models */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className="px-3 md:px-6 py-3 hover:text-primary-600 transition-colors bg-transparent hover:bg-transparent data-[state=open]:bg-transparent"
                  onMouseEnter={() => handleTriggerEnter("models")}
                  onMouseLeave={handleTriggerLeave}
                >
                  {t('megaMenu.models')}
                </NavigationMenuTrigger>
              </NavigationMenuItem>

              {/* Sizes */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className="px-3 md:px-6 py-3 hover:text-primary-600 transition-colors bg-transparent hover:bg-transparent data-[state=open]:bg-transparent"
                  onMouseEnter={() => handleTriggerEnter("sizes")}
                  onMouseLeave={handleTriggerLeave}
                >
                  {t('megaMenu.sizes')}
                </NavigationMenuTrigger>
              </NavigationMenuItem>

              {/* Categories */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className="px-3 md:px-6 py-3 hover:text-primary-600 transition-colors bg-transparent hover:bg-transparent data-[state=open]:bg-transparent"
                  onMouseEnter={() => handleTriggerEnter("categories")}
                  onMouseLeave={handleTriggerLeave}
                >
                  {t('megaMenu.categories')}
                </NavigationMenuTrigger>
              </NavigationMenuItem>

              {/* Important */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className="px-3 md:px-6 py-3 hover:text-primary-600 transition-colors bg-transparent hover:bg-transparent data-[state=open]:bg-transparent"
                  onMouseEnter={() => handleTriggerEnter("important")}
                  onMouseLeave={handleTriggerLeave}
                >
                  {t('megaMenu.important')}
                </NavigationMenuTrigger>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>

      {/* Full-screen dropdown positioned below navigation */}
      {active && createPortal(
        <div
          className="fixed left-0 w-full z-40 pointer-events-none"
          style={{ top: `${navHeight}px` }}
        >
          <div
            id="megamenu-dropdown"
            className="w-full pointer-events-auto"
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
            {renderDropdownContent()}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}