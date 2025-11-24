"use client";
import React, { useState, useRef, useEffect } from "react";
import type L from "leaflet";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import { MapPin, Navigation, Edit3, Check } from "lucide-react";

export default function ReportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [formData, setFormData] = useState({
    category: "WET",
    note: "",
    lat: 0,
    lng: 0,
  });

  const [address, setAddress] = useState({
    houseNo: "",
    street: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
    fullAddress: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Location states
  const [locationMode, setLocationMode] = useState<"map" | "manual">("map");
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === "undefined" || mapLoaded) return;

    const loadLeaflet = async () => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    };

    loadLeaflet();
  }, [mapLoaded]);

  // Initialize map when switching to map mode
  useEffect(() => {
    if (showMap && mapLoaded && !mapRef.current) {
      setTimeout(() => {
        initMap();
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMap, mapLoaded]);

  const initMap = () => {
    const L = window.L as typeof import("leaflet");
    if (!L) return;

    // IMPORTANT: Check if container exists
    const container = document.getElementById("map-container");
    if (!container) {
      console.warn("Map container not found, retrying...");
      setTimeout(initMap, 100); // Retry after 100ms
      return;
    }

    const defaultLat = formData.lat || 28.6139;
    const defaultLng = formData.lng || 77.209;

    // Initialize map
    const map = L.map("map-container").setView([defaultLat, defaultLng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([defaultLat, defaultLng], {
      draggable: true,
    }).addTo(map);

    marker.on("dragend", function () {
      const position = marker.getLatLng();
      setFormData((prev) => ({
        ...prev,
        lat: position.lat,
        lng: position.lng,
      }));
      reverseGeocode(position.lat, position.lng);
    });

    map.on("click", function (e: L.LeafletMouseEvent) {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setFormData((prev) => ({
        ...prev,
        lat,
        lng,
      }));
      reverseGeocode(lat, lng);
    });

    mapRef.current = map;
    markerRef.current = marker;
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setFetchingAddress(true);
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
        const addr = data.address;
        setAddress({
          houseNo: addr.house_number || "",
          street: addr.road || addr.street || "",
          locality: addr.suburb || addr.neighbourhood || addr.quarter || "",
          city: addr.city || addr.town || addr.village || "",
          state: addr.state || "",
          pincode: addr.postcode || "",
          fullAddress: data.display_name || "",
        });
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setError("Failed to fetch address. You can enter it manually.");
    } finally {
      setFetchingAddress(false);
    }
  };

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }

    setFetchingLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setFormData((prev) => ({
          ...prev,
          lat,
          lng,
        }));

        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }

        await reverseGeocode(lat, lng);
        setFetchingLocation(false);
      },

      (error) => {
        setError("Failed to get your location. Please enable location access.");
        setFetchingLocation(false);
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
    setError("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!file) {
        throw new Error("Please select a file");
      }

      if (formData.lat === 0 || formData.lng === 0) {
        throw new Error("Please set location");
      }

      if (locationMode === "manual" && !address.city) {
        throw new Error("Please enter address details");
      }

      console.log("Step 1: Requesting presigned URL...");

      // Step 1: Get presigned URL
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

      console.log("Step 2: Uploading file to S3...");

      // Step 2: Upload to S3
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

      console.log("Step 3: File uploaded successfully");

      // Step 3: Extract S3 key
      const presignedUrlObj = new URL(uploadUrl);
      const s3Key = presignedUrlObj.pathname.substring(1);
      const imageUrl = `${process.env.NEXT_PUBLIC_S3_URL}/${s3Key}`;

      // Build full address string
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

      console.log("Step 4: Creating report in database...");

      // Step 4: Create report
      const reportRes = await fetch("/api/reports/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          category: formData.category,
          note: formData.note || undefined,
          lat: formData.lat,
          lng: formData.lng,
          // Address fields
          address: fullAddressString || undefined,
          houseNo: address.houseNo || undefined,
          street: address.street || undefined,
          locality: address.locality || undefined,
          city: address.city || undefined,
          state: address.state || undefined,
          pincode: address.pincode || undefined,
        }),
      });

      if (!reportRes.ok) {
        const errData = await reportRes.json();
        throw new Error(errData.error || "Report creation failed");
      }

      console.log("Report created successfully!");
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/user");
      }, 2000);
    } catch (err: unknown) {
      console.error("Error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const isLocationSet = formData.lat !== 0 && formData.lng !== 0;
  const isAddressComplete =
    locationMode === "manual"
      ? address.city && address.state
      : address.fullAddress;

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Report Waste</h2>
          <p className="text-slate-400">
            Help your community by reporting segregated waste
          </p>
        </div>

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-400 p-4 rounded-lg">
            ✓ Report submitted successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN - Image & Category */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <label className="block text-white font-semibold mb-4 text-lg">
                Upload Photo *
              </label>

              {preview ? (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-80 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-80 border-2 border-dashed border-slate-600 hover:border-emerald-500 rounded-lg transition text-slate-400 hover:text-emerald-400 flex flex-col items-center justify-center gap-3"
                >
                  <span className="text-6xl"></span>
                  <span className="text-lg">Click to upload image</span>
                  <span className="text-sm text-slate-500">Max 5MB</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Category */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <label className="block text-white font-semibold mb-4 text-lg">
                Waste Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full p-4 bg-slate-700 border border-slate-600 text-white rounded-lg focus:border-emerald-500 outline-none text-lg"
              >
                <option value="WET">Wet Waste (Food, Garden)</option>
                <option value="DRY">Dry Waste (Paper, Plastic)</option>
                <option value="MIXED">Mixed Waste</option>
                <option value="HAZARDOUS">Hazardous</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Note */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <label className="block text-white font-semibold mb-4 text-lg">
                Additional Notes
              </label>
              <textarea
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="Any additional details about the waste..."
                maxLength={500}
                className="w-full p-4 bg-slate-700 border border-slate-600 text-white rounded-lg outline-none focus:border-emerald-500"
                rows={6}
              />
              <p className="text-slate-500 text-sm mt-2">
                {formData.note.length}/500 characters
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN - Location */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <label className="block text-white font-semibold mb-4 text-lg">
                Location *
              </label>

              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => {
                    setLocationMode("map");
                    if (!showMap && formData.lat === 0) {
                      handleAutoDetect();
                    }
                  }}
                  className={`p-4 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium ${
                    locationMode === "map"
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  Use Map
                </button>
                <button
                  onClick={() => setLocationMode("manual")}
                  className={`p-4 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium ${
                    locationMode === "manual"
                      ? "bg-purple-500 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  }`}
                >
                  <Edit3 className="w-5 h-5" />
                  Enter Manually
                </button>
              </div>

              {/* MAP MODE */}
              {locationMode === "map" && (
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      handleAutoDetect();
                      setShowMap(true);
                    }}
                    disabled={fetchingLocation}
                    className="w-full p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg transition flex items-center justify-center gap-2 font-medium"
                  >
                    <Navigation className="w-5 h-5" />
                    {fetchingLocation
                      ? "Detecting Location..."
                      : "Auto-detect My Location"}
                  </button>

                  {showMap && isLocationSet && (
                    <>
                      <div
                        id="map-container"
                        className="w-full h-96 rounded-lg border border-slate-600"
                        style={{ zIndex: 1 }}
                      />
                      <p className="text-slate-400 text-sm text-center">
                        Click on map or drag marker to change location
                      </p>
                    </>
                  )}

                  {!showMap && (
                    <button
                      onClick={() => setShowMap(true)}
                      className="w-full p-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                    >
                      Pick Location on Map
                    </button>
                  )}

                  {fetchingAddress && (
                    <div className="text-center text-blue-400 text-sm py-2">
                      🔍 Fetching address...
                    </div>
                  )}
                </div>
              )}

              {/* MANUAL MODE */}
              {locationMode === "manual" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="House/Flat No *"
                      value={address.houseNo}
                      onChange={(e) =>
                        setAddress({ ...address, houseNo: e.target.value })
                      }
                      className="p-3 bg-slate-700 border border-slate-600 text-white rounded-lg outline-none focus:border-purple-500"
                    />
                    <input
                      type="text"
                      placeholder="Street/Road"
                      value={address.street}
                      onChange={(e) =>
                        setAddress({ ...address, street: e.target.value })
                      }
                      className="p-3 bg-slate-700 border border-slate-600 text-white rounded-lg outline-none focus:border-purple-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Locality/Area *"
                    value={address.locality}
                    onChange={(e) =>
                      setAddress({ ...address, locality: e.target.value })
                    }
                    className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg outline-none focus:border-purple-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City *"
                      value={address.city}
                      onChange={(e) =>
                        setAddress({ ...address, city: e.target.value })
                      }
                      className="p-3 bg-slate-700 border border-slate-600 text-white rounded-lg outline-none focus:border-purple-500"
                    />
                    <input
                      type="text"
                      placeholder="State *"
                      value={address.state}
                      onChange={(e) =>
                        setAddress({ ...address, state: e.target.value })
                      }
                      className="p-3 bg-slate-700 border border-slate-600 text-white rounded-lg outline-none focus:border-purple-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={address.pincode}
                    onChange={(e) =>
                      setAddress({ ...address, pincode: e.target.value })
                    }
                    className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleAutoDetect}
                    disabled={fetchingLocation}
                    className="w-full p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    {fetchingLocation
                      ? "Getting coordinates..."
                      : "Get GPS Coordinates"}
                  </button>
                </div>
              )}

              {/* Address Display */}
              {isLocationSet && (
                <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-emerald-400 font-semibold text-sm">
                      Location Confirmed
                    </h3>
                    {locationMode === "map" && (
                      <button
                        onClick={() => setLocationMode("manual")}
                        className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                    )}
                  </div>

                  {address.fullAddress || (address.city && address.state) ? (
                    <div className="space-y-2">
                      <p className="text-white text-sm">
                        {locationMode === "map" && address.fullAddress
                          ? address.fullAddress
                          : [
                              address.houseNo,
                              address.street,
                              address.locality,
                              address.city,
                              address.state,
                              address.pincode,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                      </p>
                      <p className="text-slate-400 text-xs">
                        Coordinates: {formData.lat.toFixed(6)},{" "}
                        {formData.lng.toFixed(6)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">
                      Coordinates: {formData.lat.toFixed(6)},{" "}
                      {formData.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !file || !isLocationSet || !isAddressComplete}
          className="w-full p-5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition flex items-center justify-center gap-2"
        >
          {loading ? (
            "Submitting Report..."
          ) : (
            <>
              <Check className="w-6 h-6" />
              Submit Waste Report
            </>
          )}
        </button>
      </div>
    </DashboardLayout>
  );
}
