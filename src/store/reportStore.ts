import { create } from "zustand";

interface FormData {
  category: string;
  note: string;
  lat: number;
  lng: number;
}

interface Address {
  houseNo: string;
  street: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  fullAddress: string;
}

interface ReportState {
  formData: FormData;
  address: Address;
  file: File | null;
  preview: string;
  loading: boolean;
  error: string;
  success: boolean;
  locationMode: "map" | "manual";
  fetchingLocation: boolean;
  fetchingAddress: boolean;
  mapLoaded: boolean;
  showMap: boolean;

  setFormData: (data: Partial<FormData>) => void;
  setAddress: (addr: Partial<Address>) => void;
  setFile: (file: File | null) => void;
  setPreview: (preview: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setSuccess: (success: boolean) => void;
  setLocationMode: (mode: "map" | "manual") => void;
  setFetchingLocation: (fetching: boolean) => void;
  setFetchingAddress: (fetching: boolean) => void;
  setMapLoaded: (loaded: boolean) => void;
  setShowMap: (show: boolean) => void;

  reverseGeocode: (lat: number, lng: number) => Promise<void>;
  handleAutoDetect: (
    mapRef?: React.MutableRefObject<L.Map | null>,
    markerRef?: React.MutableRefObject<L.Marker | null>
  ) => void;
  handleFileChange: (file: File) => void;
  submitReport: () => Promise<boolean>;
  resetForm: () => void;
}

const initialFormData: FormData = {
  category: "WET",
  note: "",
  lat: 0,
  lng: 0,
};

const initialAddress: Address = {
  houseNo: "",
  street: "",
  locality: "",
  city: "",
  state: "",
  pincode: "",
  fullAddress: "",
};

// Helper function to parse OpenStreetMap address data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseOSMAddress = (osmData: any): Address => {
  const addr = osmData.address;

  // Priority order for city detection (most specific to least)
  const city =
    addr.city ||
    addr.town ||
    addr.municipality ||
    addr.village ||
    // Fallback to district if nothing else available
    (addr.county && !addr.city && !addr.town ? addr.county : "") ||
    "";

  // Priority order for locality/area detection
  const locality =
    addr.suburb ||
    addr.neighbourhood ||
    addr.quarter ||
    addr.hamlet ||
    addr.residential ||
    addr.locality ||
    "";

  // State name
  const state = addr.state || "";

  // Street and house details
  const houseNo = addr.house_number || "";
  const street = addr.road || addr.street || addr.pedestrian || "";
  const pincode = addr.postcode || "";

  // Build a clean full address (only include non-empty parts)
  const addressParts = [houseNo, street, locality, city, state, pincode].filter(
    (part) => part && part.trim()
  );

  return {
    houseNo,
    street,
    locality,
    city,
    state,
    pincode,
    fullAddress: addressParts.join(", "),
  };
};

export const useReportStore = create<ReportState>((set, get) => ({
  formData: initialFormData,
  address: initialAddress,
  file: null,
  preview: "",
  loading: false,
  error: "",
  success: false,
  locationMode: "map",
  fetchingLocation: false,
  fetchingAddress: false,
  mapLoaded: false,
  showMap: false,

  setFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),

  setAddress: (addr) =>
    set((state) => ({ address: { ...state.address, ...addr } })),

  setFile: (file) => set({ file }),
  setPreview: (preview) => set({ preview }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
  setLocationMode: (mode) => {
    // Keep map visible when switching modes if location is already set
    const currentState = get();
    const keepMapVisible =
      mode === "map" &&
      currentState.formData.lat !== 0 &&
      currentState.formData.lng !== 0;

    set({
      locationMode: mode,
      showMap: keepMapVisible || currentState.showMap,
    });
  },
  setFetchingLocation: (fetching) => set({ fetchingLocation: fetching }),
  setFetchingAddress: (fetching) => set({ fetchingAddress: fetching }),
  setMapLoaded: (loaded) => set({ mapLoaded: loaded }),
  setShowMap: (show) => set({ showMap: show }),

  reverseGeocode: async (lat, lng) => {
    set({ fetchingAddress: true, error: "" });
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            "User-Agent": "WasteReportApp/1.0",
          },
        }
      );

      const data = await response.json();

      if (data.address) {
        const parsedAddress = parseOSMAddress(data);

        // Validate that we have at least city and state
        if (!parsedAddress.city || !parsedAddress.state) {
          console.warn("Incomplete address data from OSM:", {
            received: data.address,
            parsed: parsedAddress,
          });

          set({
            error:
              "Could not determine complete address. Please verify or enter manually.",
            address: parsedAddress, // Still set what we got
          });
          return;
        }

        console.log("Parsed address:", parsedAddress);
        set({
          address: parsedAddress,
          error: "",
        });
      } else {
        throw new Error("No address data received from geocoding service");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      set({
        error: "Failed to fetch address. Please enter it manually.",
      });
    } finally {
      set({ fetchingAddress: false });
    }
  },

  handleAutoDetect: (mapRef, markerRef) => {
    if (!navigator.geolocation) {
      set({ error: "Geolocation not supported by your browser" });
      return;
    }

    set({ fetchingLocation: true, error: "" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        get().setFormData({ lat, lng });

        if (mapRef?.current && markerRef?.current) {
          mapRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }

        await get().reverseGeocode(lat, lng);
        set({ fetchingLocation: false });
      },
      (error) => {
        let errorMessage = "Failed to get your location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location permissions in your browser.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Location information unavailable. Please try again or enter manually.";
            break;
          case error.TIMEOUT:
            errorMessage =
              "Location request timed out. Please try again or enter address manually.";
            break;
        }

        set({
          error: errorMessage,
          fetchingLocation: false,
        });
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000,
      }
    );
  },

  handleFileChange: (selectedFile) => {
    if (!selectedFile.type.startsWith("image/")) {
      set({ error: "Only image files are allowed" });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      set({ error: "File size must be less than 5MB" });
      return;
    }

    set({ file: selectedFile, error: "" });

    const reader = new FileReader();
    reader.onloadend = () => {
      set({ preview: reader.result as string });
    };
    reader.readAsDataURL(selectedFile);
  },

  submitReport: async () => {
    const { file, formData, address, locationMode } = get();

    set({ loading: true, error: "" });

    try {
      if (!file) {
        throw new Error("Please select a file");
      }

      if (formData.lat === 0 || formData.lng === 0) {
        throw new Error("Please set location");
      }

      // Validate required address fields
      if (!address.city || !address.state) {
        throw new Error(
          "City and State are required. Please verify the address or enter manually."
        );
      }

      // Get presigned URL
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!presignRes.ok) {
        const errData = await presignRes.json();
        throw new Error(errData.error || "Failed to get presigned URL");
      }

      const presignData = await presignRes.json();
      const uploadUrl = presignData.data?.uploadUrl;

      if (!uploadUrl) {
        throw new Error("No upload URL in response");
      }

      // Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(`File upload failed: ${uploadRes.status}`);
      }

      // Get image URL
      const presignedUrlObj = new URL(uploadUrl);
      const s3Key = presignedUrlObj.pathname.substring(1);
      const imageUrl = `${process.env.NEXT_PUBLIC_S3_URL}/${s3Key}`;

      // Build address string - use parsed components from OSM or manual entry
      const fullAddressString =
        locationMode === "manual"
          ? [
              address.houseNo,
              address.street,
              address.locality,
              address.city,
              address.state,
              address.pincode,
            ]
              .filter(Boolean)
              .join(", ")
          : address.fullAddress;

      // Create report with all address fields properly filled
      const reportRes = await fetch("/api/reports/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          category: formData.category,
          note: formData.note || undefined,
          lat: formData.lat,
          lng: formData.lng,
          address: fullAddressString || undefined,
          // Always send individual address components
          houseNo: address.houseNo || undefined,
          street: address.street || undefined,
          locality: address.locality || undefined,
          city: address.city, // Required
          state: address.state, // Required
          pincode: address.pincode || undefined,
        }),
      });

      if (!reportRes.ok) {
        const errData = await reportRes.json();
        throw new Error(errData.error || "Report creation failed");
      }

      set({ success: true, loading: false });
      return true;
    } catch (err: unknown) {
      console.error("Error:", err);
      if (err instanceof Error) {
        set({ error: err.message, loading: false });
      } else {
        set({ error: "An unknown error occurred", loading: false });
      }
      return false;
    }
  },

  resetForm: () => {
    set({
      formData: initialFormData,
      address: initialAddress,
      file: null,
      preview: "",
      loading: false,
      error: "",
      success: false,
      locationMode: "map",
      fetchingLocation: false,
      fetchingAddress: false,
      showMap: false,
    });
  },
}));
