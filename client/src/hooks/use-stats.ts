import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useStats(period?: string) {
  const queryKey = period ? [api.stats.get.path, { period }] : [api.stats.get.path];
  const url = period ? `${api.stats.get.path}?period=${period}` : api.stats.get.path;
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.stats.get.responses[200].parse(await res.json());
    },
  });
}
