"use client";

import { useState } from "react";
import { Plus, X, Navigation } from "lucide-react";

export type VehicleType = "BIKE" | "AUTO" | "SMALL_TRUCK" | "TRUCK" | "OTHER";

export interface ServiceArea {
  city: string;
  state: string;
  locality: string;
  priority: number;
}

export interface FormData {
  baseLocation: string; // Only for display
  city: string;
  state: string;
  pincode: string;
  serviceRadius: number;
  vehicleType: VehicleType;
  maxTasksPerDay: number;
  baseLat: number;
  baseLng: number;
  serviceAreas: ServiceArea[];
}

interface ProfileSetupProps {
  onSubmit: (payload: FormData) => Promise<boolean>;
}

export default function ProfileSetup({ onSubmit }: ProfileSetupProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    baseLocation: "",
    city: "",
    state: "",
    pincode: "",
    serviceRadius: 10,
    vehicleType: "AUTO",
    maxTasksPerDay: 10,
    baseLat: 0,
    baseLng: 0,
    serviceAreas: [{ city: "", state: "", locality: "", priority: 1 }],
  });

  // -----------------------------
  // HANDLERS
  // -----------------------------

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updateServiceArea = (
    index: number,
    field: keyof ServiceArea,
    value: string | number
  ) => {
    const updated = [...formData.serviceAreas];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, serviceAreas: updated }));
  };

  const addServiceArea = () => {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: [
        ...prev.serviceAreas,
        { city: "", state: "", locality: "", priority: 2 },
      ],
    }));
  };

  const removeServiceArea = (index: number) => {
    if (formData.serviceAreas.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter((_, i) => i !== index),
    }));
  };

  // -----------------------------
  // GPS LOCATION
  // -----------------------------

  const handleGetLocation = () => {
    console.log("📍 Use Current Location clicked");

    if (!navigator.geolocation) {
      setErrors((prev) => ({
        ...prev,
        location: "Geolocation not supported.",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("✅ GPS Success:", pos.coords);

        setFormData((prev) => ({
          ...prev,
          baseLat: pos.coords.latitude,
          baseLng: pos.coords.longitude,
        }));

        // Autofill base location text for UI only
        setFormData((prev) => ({
          ...prev,
          baseLocation: `Lat ${pos.coords.latitude}, Lng ${pos.coords.longitude}`,
        }));
      },
      (err) => {
        console.log("❌ GPS Error", err);
        setErrors((prev) => ({
          ...prev,
          location: "Unable to fetch GPS location.",
        }));
      }
    );
  };

  // -----------------------------
  // VALIDATION
  // -----------------------------

  const validate = () => {
    const err: Record<string, string> = {};

    if (!formData.city.trim()) err.city = "City is required";
    if (!formData.state.trim()) err.state = "State is required";
    if (!formData.pincode.trim()) err.pincode = "Pincode is required";

    if (formData.baseLat === 0 || formData.baseLng === 0)
      err.location = "Click 'Use Current Location' to set your GPS";

    formData.serviceAreas.forEach((a, i) => {
      if (!a.locality.trim()) err[`loc_${i}`] = "Locality required";
      if (!a.city.trim()) err[`city_${i}`] = "City required";
      if (!a.state.trim()) err[`state_${i}`] = "State required";
    });

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // -----------------------------
  // SUBMIT
  // -----------------------------

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-white text-center mb-6">
        Complete Your Authority Profile
      </h2>

      <div className="bg-slate-900 p-8 rounded-2xl space-y-8">
        {/* ----------------- BASE LOCATION ----------------- */}
        <div>
          <label className="text-slate-300">Base Location *</label>
          <input
            type="text"
            value={formData.baseLocation}
            placeholder="Click 'Use Current Location'"
            onChange={(e) => updateField("baseLocation", e.target.value)}
            className="w-full bg-slate-800 text-white p-3 rounded-xl"
          />

          <button
            onClick={handleGetLocation}
            className="mt-3 px-4 py-2 bg-blue-600 rounded-xl text-white flex items-center gap-2"
          >
            <Navigation size={16} /> Use Current Location
          </button>

          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location}</p>
          )}

          <p className="text-green-400 text-sm mt-2">
            Lat: {formData.baseLat} | Lng: {formData.baseLng}
          </p>
        </div>

        {/* ----------------- CITY + STATE ----------------- */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-300">City *</label>
            <input
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
              className="w-full bg-slate-800 text-white p-3 rounded-xl"
            />
            {errors.city && (
              <p className="text-red-500 text-sm">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="text-slate-300">State *</label>
            <input
              value={formData.state}
              onChange={(e) => updateField("state", e.target.value)}
              className="w-full bg-slate-800 text-white p-3 rounded-xl"
            />
            {errors.state && (
              <p className="text-red-500 text-sm">{errors.state}</p>
            )}
          </div>
        </div>

        {/* ----------------- PINCODE ----------------- */}
        <div>
          <label className="text-slate-300">Pincode *</label>
          <input
            value={formData.pincode}
            onChange={(e) => updateField("pincode", e.target.value)}
            className="w-full bg-slate-800 text-white p-3 rounded-xl"
          />
          {errors.pincode && (
            <p className="text-red-500 text-sm">{errors.pincode}</p>
          )}
        </div>

        {/* ----------------- SERVICE AREAS ----------------- */}
        <div>
          <h3 className="text-xl text-white mb-4">Service Areas</h3>

          {formData.serviceAreas.map((a, i) => (
            <div
              key={i}
              className="bg-slate-800 p-4 rounded-xl mb-3 border border-slate-700"
            >
              <div className="flex justify-between">
                <h4 className="text-white">Area {i + 1}</h4>

                {formData.serviceAreas.length > 1 && (
                  <X
                    className="text-red-400 cursor-pointer"
                    onClick={() => removeServiceArea(i)}
                  />
                )}
              </div>

              <input
                placeholder="Locality"
                value={a.locality}
                onChange={(e) =>
                  updateServiceArea(i, "locality", e.target.value)
                }
                className="w-full bg-slate-900 text-white p-2 rounded-md mt-2"
              />

              <input
                placeholder="City"
                value={a.city}
                onChange={(e) => updateServiceArea(i, "city", e.target.value)}
                className="w-full bg-slate-900 text-white p-2 rounded-md mt-2"
              />

              <input
                placeholder="State"
                value={a.state}
                onChange={(e) => updateServiceArea(i, "state", e.target.value)}
                className="w-full bg-slate-900 text-white p-2 rounded-md mt-2"
              />
            </div>
          ))}

          <button
            onClick={addServiceArea}
            className="w-full py-3 bg-slate-700 rounded-xl text-white flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add Another Area
          </button>
        </div>

        {/* ----------------- SUBMIT ----------------- */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-blue-600 rounded-xl text-white font-bold disabled:opacity-50"
        >
          {loading ? "Saving..." : "Complete Setup"}
        </button>
      </div>
    </div>
  );
}
