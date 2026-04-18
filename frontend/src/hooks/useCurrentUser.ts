"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Employee } from "@/types";

export function useCurrentUser(redirectIfUnauthenticated = true): Employee | null {
  const [user, setUser] = useState<Employee | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      if (redirectIfUnauthenticated) {
        router.push("/login");
      }
      return;
    }
    try {
      setUser(JSON.parse(userStr));
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      if (redirectIfUnauthenticated) {
        router.push("/login");
      }
    }
  }, [redirectIfUnauthenticated, router]);

  if (!isClient) return null;
  return user;
}

export function useHasRole(...roles: Employee["role"][]): boolean {
  const user = useCurrentUser(false);
  if (!user) return false;
  return roles.map(r => r.toUpperCase()).includes(user.role?.toUpperCase() as Employee["role"]);
}
