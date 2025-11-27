// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "user" | "volunteer" | "admin" | "authority";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  points: number;
  city?: string;
  state?: string;
  emailVerified: boolean;
  loginTime: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (userData: Omit<User, "loginTime">) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<User>) => void;
  checkSession: () => boolean;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;

  // Computed getters
  isAuthenticated: () => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  getDashboardRoute: () => string;
}

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isInitialized: false,

      initialize: () => {
        const state = get();
        if (state.user) {
          const isValid = state.checkSession();
          if (!isValid) {
            state.clearUser();
          }
        }
        set({ isInitialized: true, isLoading: false });
      },

      setUser: (userData) => {
        const user: User = {
          ...userData,
          loginTime: Date.now(),
        };
        set({ user, isLoading: false });
        console.log("User logged in:", user.name, "| Role:", user.role);
      },

      clearUser: () => {
        set({ user: null, isLoading: false });
        console.log("User logged out");
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      checkSession: () => {
        const user = get().user;
        if (!user || !user.loginTime) return false;

        const isValid = Date.now() - user.loginTime < SESSION_DURATION;
        if (!isValid) {
          get().clearUser();
          console.log("Session expired");
        }
        return isValid;
      },

      isAuthenticated: () => {
        return get().checkSession() && !!get().user;
      },

      hasRole: (roles) => {
        const user = get().user;
        if (!user) return false;

        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(user.role);
      },

      getDashboardRoute: () => {
        const user = get().user;
        if (!user) return "/login";

        const routes: Record<UserRole, string> = {
          user: "/dashboard/user",
          volunteer: "/dashboard/volunteer",
          admin: "/dashboard/admin",
          authority: "/dashboard/authority",
        };

        return routes[user.role];
      },

      // Fetch user from API
      fetchUser: async () => {
        const currentUser = get().user;

        // If we already have user data, skip
        if (currentUser) return;

        set({ isLoading: true });

        try {
          const response = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include",
          });

          if (!response.ok) {
            if (response.status === 401) {
              get().clearUser();
            }
            throw new Error("Failed to fetch user data");
          }

          const data = await response.json();

          if (data.success && data.data.user) {
            get().setUser({
              id: data.data.user.id,
              name: data.data.user.name,
              email: data.data.user.email,
              role: data.data.user.role,
              points: data.data.user.points,
              city: data.data.user.city,
              state: data.data.user.state,
              emailVerified: true,
            });
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          get().clearUser();
        } finally {
          set({ isLoading: false });
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });

        try {
          const response = await fetch("/api/auth/logout", {
            method: "POST",
          });

          if (response.ok) {
            get().clearUser();
            console.log("Logout successful");
          } else {
            console.error("Logout failed");
          }
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initialize();
        }
      },
      version: 1,
    }
  )
);
