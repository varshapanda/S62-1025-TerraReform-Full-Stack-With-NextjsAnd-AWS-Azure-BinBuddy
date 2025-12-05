// src/store/userStore.ts

import { create } from "zustand";

interface Task {
  id: string;
  status:
    | "PENDING"
    | "ASSIGNED"
    | "SCHEDULED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  scheduledFor?: string;
  startedAt?: string;
  completedAt?: string;
}

interface Report {
  id: string;
  category: string;
  status: string;
  createdAt: string;
  verifiedAt?: string;
  scheduledAt?: string;
  completedAt?: string;
  imageUrl?: string;
  note?: string;
  lat: number;
  lng: number;
  address?: string;
  images?: Array<{ url: string }>;
  task?: Task; // ✅ ADDED: Task relationship
}

interface UserStats {
  total: number;
  verified: number;
  pending: number;
  scheduled: number;
  completed: number;
}

interface UserState {
  // Reports data
  reports: Report[];
  allReports: Report[];
  currentReport: Report | null;
  filteredReports: Report[];

  // Stats
  stats: UserStats;

  // Loading states
  loading: boolean;
  reportLoading: boolean;

  // Errors
  reportError: string;

  // Filters
  searchQuery: string;
  filterStatus: string;
  filterCategory: string;

  // Volunteer modal
  showVolunteerModal: boolean;
  volunteerSubmitted: boolean;
  volunteerLoading: boolean;
  volunteerError: string | null;

  // Actions
  fetchReports: () => Promise<void>;
  fetchAllReports: () => Promise<void>;
  fetchReportById: (id: string) => Promise<void>;
  calculateStats: () => void;

  // Filter actions
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string) => void;
  setFilterCategory: (category: string) => void;
  applyFilters: () => void;

  // Volunteer actions
  setShowVolunteerModal: (show: boolean) => void;
  submitVolunteerRequest: () => Promise<void>;
  resetVolunteerState: () => void;

  // Reset
  resetReportError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  reports: [],
  allReports: [],
  currentReport: null,
  filteredReports: [],
  stats: {
    total: 0,
    verified: 0,
    pending: 0,
    scheduled: 0,
    completed: 0,
  },
  loading: false,
  reportLoading: false,
  reportError: "",
  searchQuery: "",
  filterStatus: "ALL",
  filterCategory: "ALL",
  showVolunteerModal: false,
  volunteerSubmitted: false,
  volunteerLoading: false,
  volunteerError: null,

  // Fetch recent 10 reports for dashboard
  fetchReports: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/reports/my-reports");
      const data = await res.json();
      if (data.success) {
        set({ reports: data.data, loading: false });
        get().fetchAllReports();
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      set({ loading: false });
    }
  },

  // Fetch all reports for stats and filtering
  fetchAllReports: async () => {
    try {
      const res = await fetch("/api/reports/my-reports?all=true");
      const data = await res.json();
      if (data.success) {
        set({ allReports: data.data, filteredReports: data.data });
        get().calculateStats();
        get().applyFilters();
      }
    } catch (error) {
      console.error("Failed to fetch all reports:", error);
    }
  },

  // Fetch single report by ID
  fetchReportById: async (id: string) => {
    set({ reportLoading: true, reportError: "" });
    try {
      const res = await fetch(`/api/reports/${id}`);
      const data = await res.json();
      if (data.success) {
        set({ currentReport: data.data, reportLoading: false });
      } else {
        set({
          reportError: data.error || "Failed to fetch report details",
          reportLoading: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
      set({
        reportError: "Something went wrong. Please try again.",
        reportLoading: false,
      });
    }
  },

  // Calculate stats from all reports
  calculateStats: () => {
    const { allReports } = get();
    const stats = {
      total: allReports.length,
      verified: allReports.filter((r) => r.status === "VERIFIED").length,
      pending: allReports.filter((r) => r.status === "PENDING").length,
      scheduled: allReports.filter((r) => r.status === "SCHEDULED").length,
      completed: allReports.filter((r) => r.status === "COMPLETED").length,
    };
    set({ stats });
  },

  // Filter actions
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setFilterStatus: (status) => {
    set({ filterStatus: status });
    get().applyFilters();
  },

  setFilterCategory: (category) => {
    set({ filterCategory: category });
    get().applyFilters();
  },

  applyFilters: () => {
    const { allReports, searchQuery, filterStatus, filterCategory } = get();
    let filtered = [...allReports];

    if (filterStatus !== "ALL") {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    if (filterCategory !== "ALL") {
      filtered = filtered.filter((r) => r.category === filterCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    set({ filteredReports: filtered });
  },

  // Volunteer modal actions
  setShowVolunteerModal: (show) => {
    set({ showVolunteerModal: show });
    if (!show) {
      get().resetVolunteerState();
    }
  },

  submitVolunteerRequest: async () => {
    set({ volunteerLoading: true, volunteerError: null });

    try {
      const response = await fetch("/api/volunteer-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      set({ volunteerSubmitted: true, volunteerLoading: false });

      setTimeout(() => {
        set({ showVolunteerModal: false, volunteerSubmitted: false });
      }, 5000);
    } catch (err) {
      console.error("Error submitting volunteer request:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      set({ volunteerError: message, volunteerLoading: false });
    }
  },

  resetVolunteerState: () => {
    set({
      volunteerSubmitted: false,
      volunteerError: null,
      volunteerLoading: false,
    });
  },

  resetReportError: () => {
    set({ reportError: "" });
  },
}));
