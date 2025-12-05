// src/store/leaderboardStore.ts
import { create } from "zustand";

interface LeaderboardUser {
  verificationsCount: ReactNode;
  verifiedReports: ReactNode;
  id: string;
  name: string;
  email: string;
  points: number;
  rank: number;
  role: string;
  tasksCompleted?: number;
  city?: string;
  locality?: string;
}

interface CommunityLeaderboard {
  locality: string;
  city: string;
  totalPoints: number;
  totalReports: number;
  verifiedReports: number;
  activeUsers: number;
  rank: number;
}

interface LeaderboardState {
  // Data
  topUsers: LeaderboardUser[];
  topVolunteers: LeaderboardUser[];
  topCommunities: CommunityLeaderboard[];
  currentUserRank: LeaderboardUser | null;

  // Filters
  timeRange: "all" | "week" | "month";
  selectedCity: string;

  // Loading states
  loading: boolean;
  error: string | null;

  // Actions
  fetchTopUsers: (limit?: number) => Promise<void>;
  fetchTopVolunteers: (limit?: number) => Promise<void>;
  fetchTopCommunities: (city?: string, limit?: number) => Promise<void>;
  fetchCurrentUserRank: () => Promise<void>;
  setTimeRange: (range: "all" | "week" | "month") => void;
  setSelectedCity: (city: string) => void;
  refreshAllLeaderboards: () => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  // Initial state
  topUsers: [],
  topVolunteers: [],
  topCommunities: [],
  currentUserRank: null,
  timeRange: "all",
  selectedCity: "ALL",
  loading: false,
  error: null,

  // Fetch top users (residents with most points from verified reports)
  fetchTopUsers: async (limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `/api/leaderboard/users?limit=${limit}&timeRange=${get().timeRange}`
      );
      if (!response.ok) throw new Error("Failed to fetch top users");
      const data = await response.json();
      set({ topUsers: data.data || [], loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      });
    }
  },

  // Fetch top volunteers (by verification count)
  fetchTopVolunteers: async (limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `/api/leaderboard/volunteers?limit=${limit}&timeRange=${get().timeRange}`
      );
      if (!response.ok) throw new Error("Failed to fetch top volunteers");
      const data = await response.json();
      set({ topVolunteers: data.data || [], loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      });
    }
  },

  // Fetch top communities (by locality)
  fetchTopCommunities: async (city?: string, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const cityParam = city || get().selectedCity;
      const url = `/api/leaderboard/communities?limit=${limit}&timeRange=${get().timeRange}${cityParam !== "ALL" ? `&city=${cityParam}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch top communities");
      const data = await response.json();
      set({ topCommunities: data.data || [], loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      });
    }
  },

  // Fetch current user's rank
  fetchCurrentUserRank: async () => {
    try {
      const response = await fetch("/api/leaderboard/me");
      if (!response.ok) throw new Error("Failed to fetch user rank");
      const data = await response.json();
      set({ currentUserRank: data.data || null });
    } catch (error) {
      console.error("Error fetching user rank:", error);
      set({ currentUserRank: null });
    }
  },

  // Set time range filter
  setTimeRange: (range) => {
    set({ timeRange: range });
    get().refreshAllLeaderboards();
  },

  // Set city filter
  setSelectedCity: (city) => {
    set({ selectedCity: city });
    get().fetchTopCommunities(city);
  },

  // Refresh all leaderboards
  refreshAllLeaderboards: async () => {
    const {
      fetchTopUsers,
      fetchTopVolunteers,
      fetchTopCommunities,
      fetchCurrentUserRank,
    } = get();
    await Promise.all([
      fetchTopUsers(),
      fetchTopVolunteers(),
      fetchTopCommunities(),
      fetchCurrentUserRank(),
    ]);
  },
}));
