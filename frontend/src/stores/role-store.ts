import { create } from "zustand";
import type { Role } from "@/lib/mock-data";

interface RoleState {
  role: Role;
  isAuthenticated: boolean;
  setRole: (r: Role) => void;
  login: (r: Role) => void;
  logout: () => void;
}

export const useRoleStore = create<RoleState>((set) => ({
  role: "member",
  isAuthenticated: false,
  setRole: (role) => set({ role }),
  login: (role) => set({ role, isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
}));
