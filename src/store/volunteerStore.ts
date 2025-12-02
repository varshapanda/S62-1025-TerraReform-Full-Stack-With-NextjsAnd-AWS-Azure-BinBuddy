import { create } from "zustand";

interface VolunteerStats {
  pending: number;
  verifiedToday: number;
  totalVerified: number;
}

interface Report {
  id: string;
  imageUrl: string;
  category: string;
  note?: string;
  lat: number;
  lng: number;
  address?: string;
  houseNo?: string;
  street?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  createdAt: string;
  status?: string;
  verifiedAt?: string;
  remarks?: string;
  rejectionReason?: string;
  reporter: {
    name?: string;
    email: string;
  };
  images: Array<{
    url: string;
  }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface VolunteerState {
  stats: VolunteerStats;
  pendingReports: Report[];
  historyReports: Report[];
  pendingPagination: PaginationInfo;
  historyPagination: PaginationInfo;
  loading: boolean;
  selectedReport: Report | null;
  verificationNote: string;
  isVerifying: boolean;
  statusFilter: "VERIFIED" | "REJECTED";

  // Actions
  fetchStats: () => Promise<void>;
  fetchPendingReports: (page?: number) => Promise<void>;
  fetchHistoryReports: (
    status: "VERIFIED" | "REJECTED",
    page?: number
  ) => Promise<void>;
  setSelectedReport: (report: Report | null) => void;
  setVerificationNote: (note: string) => void;
  setStatusFilter: (status: "VERIFIED" | "REJECTED") => void;
  verifyReport: (
    reportId: string,
    status: "VERIFIED" | "REJECTED",
    note?: string
  ) => Promise<boolean>;
  resetVerificationState: () => void;
}

export const useVolunteerStore = create<VolunteerState>((set, get) => ({
  stats: {
    pending: 0,
    verifiedToday: 0,
    totalVerified: 0,
  },
  pendingReports: [],
  historyReports: [],
  pendingPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  historyPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  loading: false,
  selectedReport: null,
  verificationNote: "",
  isVerifying: false,
  statusFilter: "VERIFIED",

  fetchStats: async () => {
    try {
      const response = await fetch("/api/volunteer/stats");
      const result = await response.json();

      if (result.success) {
        set({ stats: result.data });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  },

  fetchPendingReports: async (page = 1) => {
    set({ loading: true });
    try {
      const { pendingPagination } = get();
      // 🎯 Changed from /pending to /queue
      const response = await fetch(
        `/api/volunteer/queue?page=${page}&limit=${pendingPagination.limit}`
      );
      const result = await response.json();

      if (result.success) {
        set({
          pendingReports: result.data.reports,
          pendingPagination: result.data.pagination,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch assigned reports:", error);
      set({ loading: false });
    }
  },

  fetchHistoryReports: async (status, page = 1) => {
    set({ loading: true });
    try {
      const { historyPagination } = get();
      const response = await fetch(
        `/api/volunteer/history?status=${status}&page=${page}&limit=${historyPagination.limit}`
      );
      const result = await response.json();

      if (result.success) {
        set({
          historyReports: result.data.reports,
          historyPagination: result.data.pagination,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
      set({ loading: false });
    }
  },

  setSelectedReport: (report) => set({ selectedReport: report }),

  setVerificationNote: (note) => set({ verificationNote: note }),

  setStatusFilter: (status) => set({ statusFilter: status }),

  verifyReport: async (reportId, status, note) => {
    set({ isVerifying: true });
    try {
      const response = await fetch("/api/volunteer/reports/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId,
          status,
          verificationNote: note?.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        set({ isVerifying: false, selectedReport: null, verificationNote: "" });
        // Refresh data
        get().fetchStats();
        get().fetchPendingReports();
        return true;
      } else {
        set({ isVerifying: false });
        return false;
      }
    } catch (error) {
      console.error("Verification error:", error);
      set({ isVerifying: false });
      return false;
    }
  },

  resetVerificationState: () => {
    set({
      selectedReport: null,
      verificationNote: "",
      isVerifying: false,
    });
  },
}));
