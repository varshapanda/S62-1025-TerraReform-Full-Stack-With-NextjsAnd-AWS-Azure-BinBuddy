// src/store/adminStore.ts
import { create } from "zustand";

interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  state?: string;
  city?: string;
  createdAt: string;
}

interface VolunteerRequest {
  id: number;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  reviewedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

interface Report {
  id: string;
  reporterId: string;
  imageUrl: string;
  category: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  note?: string;
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  state?: string;
  createdAt: string;
  verifiedAt?: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  images: Array<{
    id: string;
    url: string;
  }>;
  verifications?: Array<{
    id: string;
    decision: string;
    verificationNote?: string;
    volunteer: {
      id: string;
      name: string;
    };
  }>;
}

interface AdminStats {
  totalUsers: number;
  totalReports: number;
  activeTasks: number;
  systemHealth: number;
  pendingVolunteerRequests: number;
  recentReports: number;
  reportsToday: number;
  roleBreakdown: Record<string, number>;
}

type MessageType = {
  type: "success" | "error";
  text: string;
};

interface ConfirmDialogConfig {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface AdminState {
  users: UserType[];
  volunteerRequests: VolunteerRequest[];
  reports: Report[];
  stats: AdminStats | null;
  loading: boolean;
  updating: string | null;
  message: MessageType | null;
  confirmDialog: ConfirmDialogConfig | null;
  filterStatus: "ALL" | "PENDING" | "APPROVED" | "REJECTED";
  reportFilterStatus: "ALL" | "PENDING" | "VERIFIED" | "REJECTED";
  processingRequestId: number | null;

  // Actions
  fetchStats: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  updateUserRole: (userId: string, newRole: string) => Promise<void>;
  deleteUser: (userId: string) => void;
  fetchVolunteerRequests: (status?: string) => Promise<void>;
  handleVolunteerAction: (
    requestId: number,
    action: "approve" | "reject"
  ) => void;
  setFilterStatus: (
    status: "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  ) => void;
  fetchReports: (status?: string) => Promise<void>;
  setReportFilterStatus: (
    status: "ALL" | "PENDING" | "VERIFIED" | "REJECTED"
  ) => void;
  deleteReport: (reportId: string) => void;
  showMessage: (type: "success" | "error", text: string) => void;
  clearMessage: () => void;
  showConfirmDialog: (config: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }) => void;
  hideConfirmDialog: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  volunteerRequests: [],
  reports: [],
  stats: null,
  loading: false,
  updating: null,
  message: null,
  confirmDialog: null,
  filterStatus: "PENDING",
  reportFilterStatus: "ALL",
  processingRequestId: null,

  fetchStats: async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        set({ stats: data.data?.stats || data.stats || null });
      } else {
        get().showMessage("error", "Failed to fetch statistics");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      get().showMessage("error", "Error loading statistics");
    }
  },

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        set({
          users: data.users || data.data?.users || [],
          loading: false,
        });
      } else {
        get().showMessage("error", "Failed to fetch users");
        set({ loading: false });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      get().showMessage("error", "Error loading users");
      set({ loading: false });
    }
  },

  updateUserRole: async (userId, newRole) => {
    set({ updating: userId });
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        get().showMessage("success", "Role updated successfully");
        get().fetchUsers();
        get().fetchStats();
      } else {
        const data = await response.json();
        get().showMessage("error", data.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      get().showMessage("error", "Error updating role");
    } finally {
      set({ updating: null });
    }
  },

  deleteUser: (userId: string) => {
    get().showConfirmDialog({
      title: "Delete User",
      message:
        "Are you sure you want to delete this user? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        get().hideConfirmDialog();
        try {
          const response = await fetch(`/api/admin/users/${userId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            get().showMessage("success", "User deleted successfully");
            get().fetchUsers();
            get().fetchStats();
          } else {
            const data = await response.json();
            get().showMessage("error", data.message || "Failed to delete user");
          }
        } catch (error) {
          console.error("Error deleting user:", error);
          get().showMessage("error", "Error deleting user");
        }
      },
    });
  },

  fetchVolunteerRequests: async (status) => {
    set({ loading: true });
    try {
      const { filterStatus } = get();
      const effectiveStatus = status || filterStatus;
      const url =
        effectiveStatus === "ALL"
          ? "/api/admin/volunteer-requests"
          : `/api/admin/volunteer-requests?status=${effectiveStatus}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        set({
          volunteerRequests: data.data?.requests || data.requests || [],
          loading: false,
        });
      } else {
        get().showMessage("error", "Failed to fetch volunteer requests");
        set({ loading: false });
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      get().showMessage("error", "Error loading volunteer requests");
      set({ loading: false });
    }
  },

  handleVolunteerAction: (requestId, action) => {
    const actionText = action === "approve" ? "Approve" : "Reject";
    get().showConfirmDialog({
      title: `${actionText} Volunteer Request`,
      message: `Are you sure you want to ${action} this volunteer request?`,
      confirmText: actionText,
      cancelText: "Cancel",
      onConfirm: async () => {
        get().hideConfirmDialog();
        set({ processingRequestId: requestId });
        try {
          const response = await fetch(
            `/api/admin/volunteer-requests/${requestId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ action }),
            }
          );

          if (response.ok) {
            get().fetchVolunteerRequests();
            get().fetchStats();
            get().showMessage(
              "success",
              `Volunteer request ${action}d successfully`
            );
          } else {
            const data = await response.json();
            get().showMessage(
              "error",
              data.error || "Failed to process request"
            );
          }
        } catch (error) {
          console.error("Error processing request:", error);
          get().showMessage("error", "Something went wrong");
        } finally {
          set({ processingRequestId: null });
        }
      },
    });
  },

  setFilterStatus: (status) => {
    set({ filterStatus: status });
    get().fetchVolunteerRequests(status);
  },

  fetchReports: async (status) => {
    set({ loading: true });
    try {
      const { reportFilterStatus } = get();
      const effectiveStatus = status || reportFilterStatus;
      const url =
        effectiveStatus === "ALL"
          ? "/api/admin/reports"
          : `/api/admin/reports?status=${effectiveStatus}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        set({
          reports: data.data?.reports || data.reports || [],
          loading: false,
        });
      } else {
        get().showMessage("error", "Failed to fetch reports");
        set({ loading: false });
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      get().showMessage("error", "Error loading reports");
      set({ loading: false });
    }
  },

  setReportFilterStatus: (status) => {
    set({ reportFilterStatus: status });
    get().fetchReports(status);
  },

  deleteReport: (reportId: string) => {
    get().showConfirmDialog({
      title: "Delete Report",
      message:
        "Are you sure you want to delete this report? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        get().hideConfirmDialog();
        try {
          const response = await fetch(`/api/admin/reports/${reportId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            get().showMessage("success", "Report deleted successfully");
            get().fetchReports();
            get().fetchStats();
          } else {
            const data = await response.json();
            get().showMessage(
              "error",
              data.message || "Failed to delete report"
            );
          }
        } catch (error) {
          console.error("Error deleting report:", error);
          get().showMessage("error", "Error deleting report");
        }
      },
    });
  },

  showMessage: (type, text) => {
    set({ message: { type, text } });
  },

  clearMessage: () => set({ message: null }),

  showConfirmDialog: (config) => {
    set({ confirmDialog: { isOpen: true, ...config } });
  },

  hideConfirmDialog: () => {
    set({ confirmDialog: null });
  },
}));
