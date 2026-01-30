import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateCheckoutRequest } from "@shared/routes";

export function useCheckouts() {
  return useQuery({
    queryKey: [api.checkouts.list.path],
    queryFn: async () => {
      const res = await fetch(api.checkouts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch checkouts");
      return api.checkouts.list.responses[200].parse(await res.json());
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useCreateCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCheckoutRequest) => {
      const res = await fetch(api.checkouts.create.path, {
        method: api.checkouts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
           const error = api.checkouts.create.responses[400].parse(await res.json());
           throw new Error(error.message);
        }
        throw new Error("Failed to create checkout");
      }
      return api.checkouts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.checkouts.list.path] }),
  });
}

export function useUpdateCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateCheckoutRequest }) => {
      const url = buildUrl(api.checkouts.get.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to update checkout");
      }
      return await res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [api.checkouts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.checkouts.get.path, id] });
    },
  });
}

export function useCheckout(id: number) {
  return useQuery({
    queryKey: [api.checkouts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.checkouts.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch checkout");
      return api.checkouts.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
