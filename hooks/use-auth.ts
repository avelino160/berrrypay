"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  businessName: string | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 401) {
      return null;
    }
    throw new Error("Failed to fetch");
  }
  return res.json();
};

export function useAuth() {
  const router = useRouter();
  const { data: user, error, isLoading, mutate } = useSWR<User | null>(
    "/api/auth/user",
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Login failed");
      }

      const userData = await res.json();
      await mutate(userData);
      router.push("/dashboard");
      return userData;
    },
    [mutate, router]
  );

  const register = useCallback(
    async (data: {
      username: string;
      password: string;
      email: string;
      fullName?: string;
      businessName?: string;
    }) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const userData = await res.json();
      await mutate(userData);
      router.push("/dashboard");
      return userData;
    },
    [mutate, router]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await mutate(null);
    router.push("/login");
  }, [mutate, router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    mutate,
  };
}
