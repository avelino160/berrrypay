import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useStats(period?: string, productId?: string) {
  const queryKey = [api.stats.get.path, { period, productId }];
  const params = new URLSearchParams();
  if (period) params.append("period", period);
  if (productId && productId !== "all") params.append("productId", productId);
  
  const url = params.toString() ? `${api.stats.get.path}?${params.toString()}` : api.stats.get.path;
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.stats.get.responses[200].parse(await res.json());
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
