import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';

interface SearchParams {
  query: string;
  brand?: string;
}

interface UseSearchOptions {
  debounceMs?: number;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export function useSearch(
  { query, brand }: SearchParams,
  options: UseSearchOptions = {}
) {
  const {
    debounceMs = 300,
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
  } = options;

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [debouncedBrand, setDebouncedBrand] = useState(brand);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Debounce the search query
  useEffect(() => {
    if (query.trim() !== debouncedQuery.trim()) {
      setIsDebouncing(true);
    }
    
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setDebouncedBrand(brand);
      setIsDebouncing(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, brand, debounceMs, debouncedQuery]);

  // Create a unique query key for caching
  const queryKey = ['search', debouncedQuery, debouncedBrand];

  // Use TanStack Query for caching and state management
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!debouncedQuery.trim()) {
        return { products: [] };
      }
      
      console.log('[DEBUG] useSearch: Making API call with:', {
        query: debouncedQuery,
        brand: debouncedBrand,
      });
      
      const response = await productsApi.search(debouncedQuery, debouncedBrand);
      
      console.log('[DEBUG] useSearch: API response:', {
        totalResults: response.products?.length || 0,
        topResult: response.products?.[0]?.name,
      });
      
      return response;
    },
    enabled: enabled && debouncedQuery.trim().length > 0,
    staleTime,
    gcTime: cacheTime, // React Query v5 uses gcTime instead of cacheTime
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Memoized search function for manual triggers
  const search = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    // Data
    results: data?.products || [],
    totalResults: data?.products?.length || 0,
    
    // Loading states
    isLoading,
    isFetching,
    isDebouncing,
    
    // Error handling
    error,
    
    // Actions
    search,
    refetch,
    
    // Query info
    query: debouncedQuery,
    brand: debouncedBrand,
    hasQuery: debouncedQuery.trim().length > 0,
    
    // Additional info
    isStale: false, // You can add this if needed
    lastUpdated: Date.now(), // You can add this if needed
  };
}
