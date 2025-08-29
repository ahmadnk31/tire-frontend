import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';

export function useBrands() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['brands-list'],
    queryFn: async () => {
      const response = await productsApi.getBrands();
      
      if (response.brands && Array.isArray(response.brands)) {
        const uniqueBrands = response.brands.map(b => b.brand).filter(b => !!b);
        const brands = ['all', ...uniqueBrands];
        return brands;
      }
      
      return ['all'];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    brands: data || ['all'],
    isLoading,
    error,
    refetch,
  };
}
