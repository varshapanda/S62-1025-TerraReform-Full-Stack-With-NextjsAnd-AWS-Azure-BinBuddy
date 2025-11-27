import { create } from "zustand";

interface Report {
  id: string;
  category: string;
  status: string;
  createdAt: string;
  imageUrl?: string;
  note?: string;
  images?: Array<{ url: string }>;
}

interface UserStats {
  total: number;
  verified: number;
  pending: number;
}

interface UserState {
  reports: Report[];
  stats: UserStats;
  loading: boolean;
  showVolunteerModal: boolean;
  volunteerSubmitted: boolean;
  volunteerLoading: boolean;
  volunteerError: string | null;

  // Actions
  fetchReports: () => Promise<void>;
  calculateStats: () => void;
  setShowVolunteerModal: (show: boolean) => void;
  submitVolunteerRequest: () => Promise<void>;
  resetVolunteerState: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  reports: [],
  stats: {
    total: 0,
    verified: 0,
    pending: 0,
  },
  loading: false,
  showVolunteerModal: false,
  volunteerSubmitted: false,
  volunteerLoading: false,
  volunteerError: null,

  fetchReports: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/reports/my-reports");
      const data = await res.json();
      if (data.success) {
        set({ reports: data.data, loading: false });
        get().calculateStats();
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      set({ loading: false });
    }
  },

  calculateStats: () => {
    const { reports } = get();
    const stats = {
      total: reports.length,
      verified: reports.filter((r) => r.status === "VERIFIED").length,
      pending: reports.filter((r) => r.status === "PENDING").length,
    };
    set({ stats });
  },

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
}));
