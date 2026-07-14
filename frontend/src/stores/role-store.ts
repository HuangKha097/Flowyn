import { create } from "zustand";
import type { Role } from "@/lib/mock-data";
import { apiFetch } from "@/lib/api/client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface RoleState {
  role: Role;
  isAuthenticated: boolean;
  status: "checking" | "authenticated" | "guest";
  user: AuthUser | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useRoleStore = create<RoleState>((set) => ({
  role: "staff",
  isAuthenticated: false,
  status: "checking",
  user: null,
  hydrate: async () => {
    try {
      const user = await apiFetch<AuthUser>("/auth/me");
      set({ user, role: user.role, isAuthenticated: true, status: "authenticated" });
    } catch {
      set({ user: null, isAuthenticated: false, status: "guest" });
    }
  },
  login: async (email, password) => {
    await apiFetch<{ user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const user = await apiFetch<AuthUser>("/auth/me");
    set({ user, role: user.role, isAuthenticated: true, status: "authenticated" });
  },
  register: async (name, email, password) => {
    await apiFetch<{ user: AuthUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    const user = await apiFetch<AuthUser>("/auth/me");
    set({ user, role: user.role, isAuthenticated: true, status: "authenticated" });
  },
  logout: async () => {
    try { await apiFetch("/auth/logout", { method: "POST" }, false); } finally {
      set({ user: null, role: "staff", isAuthenticated: false, status: "guest" });
    }
  },
}));
