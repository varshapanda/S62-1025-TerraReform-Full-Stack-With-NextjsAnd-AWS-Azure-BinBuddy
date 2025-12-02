import { create } from "zustand";

interface UserType {
  id: number;
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

type MessageType = {
  type: "success" | "error";
  text: string;
};

interface AdminState {
  users: UserType[];
  volunteerRequests: VolunteerRequest[];
  loading: boolean;
  updating: number | null;
  message: MessageType | null;
  filterStatus: "ALL" | "PENDING" | "APPROVED" | "REJECTED";
  processingRequestId: number | null;

  // Actions
  fetchUsers: () => Promise<void>;
  updateUserRole: (userId: number, newRole: string) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>; //
  fetchVolunteerRequests: (status?: string) => Promise<void>;
  handleVolunteerAction: (
    requestId: number,
    action: "approve" | "reject"
  ) => Promise<void>;
  setFilterStatus: (
    status: "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  ) => void;
  showMessage: (type: "success" | "error", text: string) => void;
  clearMessage: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  volunteerRequests: [],
  loading: false,
  updating: null,
  message: null,
  filterStatus: "PENDING",
  processingRequestId: null,

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
  deleteUser: async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        get().showMessage("success", "User deleted successfully");
        get().fetchUsers(); // Refresh list
      } else {
        const data = await response.json();
        get().showMessage("error", data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      get().showMessage("error", "Error deleting user");
    }
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
        set({ loading: false });
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      set({ loading: false });
    }
  },

  handleVolunteerAction: async (requestId, action) => {
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
      } else {
        const data = await response.json();
        alert(data.error || "Failed to process request");
      }
    } catch (error) {
      console.error("Error processing request:", error);
      alert("Something went wrong");
    } finally {
      set({ processingRequestId: null });
    }
  },

  setFilterStatus: (status) => {
    set({ filterStatus: status });
  },

  showMessage: (type, text) => {
    set({ message: { type, text } });
    setTimeout(() => {
      set({ message: null });
    }, 3000);
  },

  clearMessage: () => set({ message: null }),
}));
