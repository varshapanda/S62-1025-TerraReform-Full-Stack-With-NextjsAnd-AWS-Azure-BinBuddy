// src/store/authorityStore.ts
import { create } from "zustand";

type VehicleType = "BIKE" | "AUTO" | "SMALL_TRUCK" | "TRUCK" | "OTHER";

interface ServiceArea {
  city: string;
  state: string;
  locality: string;
  priority: number;
}

interface AuthorityProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  baseLat: number | null;
  baseLng: number | null;
  serviceRadius: number | null;
  vehicleType: VehicleType | null;
  maxTasksPerDay: number | null;
  tasksCompleted: number;
  completionRate: number;
  avgCompletionTime: number | null;
  isProfileComplete: boolean;
  city: string | null;
  state: string | null;
  serviceAreas: ServiceArea[];
}

interface ApiResponse {
  success: boolean;
  data?: {
    profile: AuthorityProfile;
  };
  error?: string;
}

interface UpdateProfileRequest {
  baseLat: number;
  baseLng: number;
  city: string;
  state: string;
  serviceRadius: number;
  vehicleType: VehicleType;
  maxTasksPerDay: number;
  serviceAreas: ServiceArea[];
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

interface AuthorityState {
  profile: AuthorityProfile | null;
  loading: boolean;
  error: string | null;
  message: MessageType | null;
  confirmDialog: ConfirmDialogConfig | null;

  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  clearProfile: () => void;
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

export const useAuthorityStore = create<AuthorityState>((set, get) => ({
  profile: null,
  loading: false,
  error: null,
  message: null,
  confirmDialog: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/authority/profile");
      const data: ApiResponse = await res.json();

      if (data.success && data.data) {
        set({ profile: data.data.profile, loading: false });
      } else {
        const errorMsg = data.error || "Failed to fetch profile";
        set({ error: errorMsg, loading: false });
        get().showMessage("error", errorMsg);
      }
    } catch (err) {
      const errorMsg = "Network error";
      set({ error: errorMsg, loading: false });
      get().showMessage("error", errorMsg);
    }
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    set({ loading: true, error: null });

    try {
      const res = await fetch("/api/authority/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json: ApiResponse = await res.json();

      if (json.success && json.data) {
        set({ profile: json.data.profile, loading: false });
        get().showMessage("success", "Profile updated successfully");
        return true;
      }

      const errorMsg = json.error || "Failed to update profile";
      set({ loading: false, error: errorMsg });
      get().showMessage("error", errorMsg);
      return false;
    } catch (err) {
      const errorMsg = "Network error";
      set({ error: errorMsg, loading: false });
      get().showMessage("error", errorMsg);
      return false;
    }
  },

  clearProfile: () => set({ profile: null, error: null }),

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
