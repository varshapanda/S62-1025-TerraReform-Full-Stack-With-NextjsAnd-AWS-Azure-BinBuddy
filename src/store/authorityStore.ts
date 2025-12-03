// src/store/authorityStore.ts
import { create } from "zustand";

type VehicleType = "BIKE" | "AUTO" | "SMALL_TRUCK" | "TRUCK" | "OTHER";

interface ServiceArea {
  id?: string;
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

interface UpdateProfileData {
  baseLat?: number;
  baseLng?: number;
  serviceRadius?: number;
  vehicleType?: VehicleType;
  maxTasksPerDay?: number;
  city?: string;
  state?: string;
}

interface ServiceAreaApiResponse {
  success: boolean;
  error?: string;
}

interface AuthorityState {
  profile: AuthorityProfile | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<boolean>;
  addServiceArea: (area: ServiceArea) => Promise<boolean>;
  removeServiceArea: (areaId: string) => Promise<boolean>;
  clearProfile: () => void;
}

export const useAuthorityStore = create<AuthorityState>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/authority/profile");
      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        set({ profile: data.data.profile, loading: false });
      } else {
        set({ error: data.error || "Failed to fetch profile", loading: false });
      }
    } catch (error) {
      set({ error: "Failed to fetch profile", loading: false });
    }
  },

  updateProfile: async (profileData: UpdateProfileData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/authority/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        set({ profile: data.data.profile, loading: false });
        return true;
      } else {
        set({
          error: data.error || "Failed to update profile",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      set({ error: "Failed to update profile", loading: false });
      return false;
    }
  },

  addServiceArea: async (area: ServiceArea) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/authority/service-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(area),
      });

      const data: ServiceAreaApiResponse = await response.json();

      if (data.success) {
        // Refresh profile to get updated service areas
        await get().fetchProfile();
        return true;
      } else {
        set({
          error: data.error || "Failed to add service area",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      set({ error: "Failed to add service area", loading: false });
      return false;
    }
  },

  removeServiceArea: async (areaId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `/api/authority/service-areas?id=${areaId}`,
        {
          method: "DELETE",
        }
      );

      const data: ServiceAreaApiResponse = await response.json();

      if (data.success) {
        // Refresh profile to get updated service areas
        await get().fetchProfile();
        return true;
      } else {
        set({
          error: data.error || "Failed to remove service area",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      set({ error: "Failed to remove service area", loading: false });
      return false;
    }
  },

  clearProfile: () => {
    set({ profile: null, error: null });
  },
}));
