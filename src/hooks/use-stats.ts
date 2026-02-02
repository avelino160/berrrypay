import { useQuery } from "@tanstack/react-query";

export interface StatsData {
  salesToday: number;
  revenuePaid: number;
  salesApproved: number;
  revenueTarget: number;
  revenueCurrent: number;
  chartData: { name: string; sales: number }[];
}

export function useStats(period?: string, productId?: string) {
  const params = new URLSearchParams();
  if (period) params.append("period", period);
  if (productId && productId !== "all") params.append("productId", productId);
  
  const queryString = params.toString();
  const url = queryString ? `/api/stats?${queryString}` : "/api/stats";
  
  return useQuery<StatsData>({
    queryKey: ["/api/stats", { period, productId }],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
