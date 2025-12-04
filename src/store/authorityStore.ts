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

interface AuthorityState {
  profile: AuthorityProfile | null;
  loading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  clearProfile: () => void;
}

export const useAuthorityStore = create<AuthorityState>((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/authority/profile");
      const data: ApiResponse = await res.json();

      if (data.success && data.data) {
        set({ profile: data.data.profile, loading: false });
      } else {
        set({
          error: data.error || "Failed to fetch profile",
          loading: false,
        });
      }
    } catch (err) {
      set({ error: "Network error", loading: false });
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
        return true;
      }

      set({
        loading: false,
        error: json.error || "Failed to update profile",
      });
      return false;
    } catch (err) {
      set({ error: "Network error", loading: false });
      return false;
    }
  },

  clearProfile: () => set({ profile: null, error: null }),
}));
