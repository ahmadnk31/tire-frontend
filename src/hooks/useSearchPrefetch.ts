import { useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';

export function useSearchPrefetch() {
  const queryClient = useQueryClient();

  const prefetchSearch = async (query: string, brand?: string) => {
    if (!query.trim()) return;

    const queryKey = ['search', query, brand];
    
    // Check if we already have this data
    const existingData = queryClient.getQueryData(queryKey);
    if (existingData) return;

    try {
      console.log('[DEBUG] Prefetching search for:', { query, brand });
      
      // Prefetch the search results
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
          const response = await productsApi.search(query, brand);
          return response;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      });
      
      console.log('[DEBUG] Search prefetch successful for:', query);
    } catch (error) {
      console.error('[DEBUG] Search prefetch failed for:', query, error);
    }
  };

  return { prefetchSearch };
}
