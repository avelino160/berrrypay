import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Checkout, InsertCheckout } from "@shared/schema";

export function useCheckouts() {
  return useQuery<Checkout[]>({
    queryKey: ["/api/checkouts"],
    queryFn: async () => {
      const res = await fetch("/api/checkouts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch checkouts");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useCheckout(id: number) {
  return useQuery<Checkout | null>({
    queryKey: ["/api/checkouts", id],
    queryFn: async () => {
      const res = await fetch(`/api/checkouts/${id}`, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch checkout");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; productId: number; slug: string }) => {
      const res = await fetch("/api/checkouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create checkout");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/checkouts"] }),
  });
}

export function useUpdateCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Checkout> }) => {
      const res = await fetch(`/api/checkouts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to update checkout");
      }
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/checkouts", id] });
    },
  });
}

export function useDeleteCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/checkouts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete checkout");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/checkouts"] }),
  });
}
