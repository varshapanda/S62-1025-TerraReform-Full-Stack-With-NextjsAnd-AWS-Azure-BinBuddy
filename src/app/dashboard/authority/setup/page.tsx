// src/app/dashboard/authority/setup/page.tsx
"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import { MapPin, Truck, Plus, X, CheckCircle, Navigation } from "lucide-react";
import { useAuthorityStore } from "@/store/authorityStore";

// Define types
type VehicleType = "BIKE" | "AUTO" | "SMALL_TRUCK" | "TRUCK" | "OTHER";

interface ServiceArea {
  city: string;
  state: string;
  locality: string;
  priority: 1 | 2;
}

interface FormData {
  baseLocation: string;
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

export default function AuthorityProfileSetupPage() {
  const router = useRouter();
  const { updateProfile } = useAuthorityStore();

  const [loading, setLoading] = useState<boolean>(false);
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

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleServiceAreaChange = (
    index: number,
    field: keyof ServiceArea,
    value: string | number
  ) => {
    const updatedAreas = [...formData.serviceAreas];
    updatedAreas[index] = {
      ...updatedAreas[index],
      [field]: value,
    } as ServiceArea;
    setFormData((prev) => ({ ...prev, serviceAreas: updatedAreas }));
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
    if (formData.serviceAreas.length > 1) {
      const updatedAreas = formData.serviceAreas.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, serviceAreas: updatedAreas }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.baseLocation.trim()) {
      newErrors.baseLocation = "Base location is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    }

    formData.serviceAreas.forEach((area, index) => {
      if (!area.locality.trim()) {
        newErrors[`area_${index}_locality`] = "Locality is required";
      }
      if (!area.city.trim()) {
        newErrors[`area_${index}_city`] = "City is required";
      }
      if (!area.state.trim()) {
        newErrors[`area_${index}_state`] = "State is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            baseLat: position.coords.latitude,
            baseLng: position.coords.longitude,
          }));
        },
        (error: GeolocationPositionError) => {
          console.warn("Geolocation error:", error);
          setErrors((prev) => ({
            ...prev,
            location: "Unable to get current location",
          }));
        }
      );
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Type assertion for updateProfile if needed
      const success = await updateProfile(
        formData as Parameters<typeof updateProfile>[0]
      );
      if (success) {
        router.push("/dashboard/authority");
      }
    } catch (error) {
      console.error("Profile setup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const vehicleOptions: { value: VehicleType; label: string }[] = [
    { value: "BIKE", label: "Motorcycle" },
    { value: "AUTO", label: "Auto Rickshaw" },
    { value: "SMALL_TRUCK", label: "Small Truck" },
    { value: "TRUCK", label: "Large Truck" },
    { value: "OTHER", label: "Other" },
  ];

  const handleTextInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof FormData
  ) => {
    handleInputChange(field, e.target.value);
  };

  const handleNumberInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof FormData
  ) => {
    handleInputChange(field, parseInt(e.target.value, 10));
  };

  return (
    <DashboardLayout role="authority">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Complete Your Authority Profile
          </h2>
          <p className="text-slate-400 text-lg">
            Set up your waste collection service to start receiving tasks
          </p>
        </div>

        {/* Form */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-8 space-y-8">
          {/* Base Location */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Base Location
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2">
                  Base Location Address *
                </label>
                <input
                  type="text"
                  value={formData.baseLocation}
                  onChange={(e) => handleTextInputChange(e, "baseLocation")}
                  placeholder="e.g., Koramangala, Bengaluru"
                  className={`w-full px-4 py-3 bg-slate-900 border ${errors.baseLocation ? "border-red-500" : "border-slate-700"} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.baseLocation && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.baseLocation}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleTextInputChange(e, "city")}
                    placeholder="e.g., Bengaluru"
                    className={`w-full px-4 py-3 bg-slate-900 border ${errors.city ? "border-red-500" : "border-slate-700"} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleTextInputChange(e, "state")}
                    placeholder="e.g., Karnataka"
                    className={`w-full px-4 py-3 bg-slate-900 border ${errors.state ? "border-red-500" : "border-slate-700"} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">Pincode *</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleTextInputChange(e, "pincode")}
                    placeholder="e.g., 560034"
                    className={`w-full px-4 py-3 bg-slate-900 border ${errors.pincode ? "border-red-500" : "border-slate-700"} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.pincode}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-2">
                  Service Radius (km)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={formData.serviceRadius}
                    onChange={(e) =>
                      handleNumberInputChange(e, "serviceRadius")
                    }
                    className="flex-1"
                  />
                  <span className="text-white font-medium w-12">
                    {formData.serviceRadius} km
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Maximum distance you are willing to travel
                </p>
              </div>

              <button
                type="button"
                onClick={handleGetLocation}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Use Current Location
              </button>
            </div>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Service Areas
            </h3>

            <div className="space-y-4">
              {formData.serviceAreas.map((area, index) => (
                <div
                  key={index}
                  className="bg-slate-900/50 border border-slate-700 rounded-xl p-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-white font-medium">
                      Service Area {index + 1}
                    </h4>
                    {formData.serviceAreas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeServiceArea(index)}
                        className="p-1 hover:bg-slate-800 rounded-lg"
                      >
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 text-sm mb-1">
                        Locality *
                      </label>
                      <input
                        type="text"
                        value={area.locality}
                        onChange={(e) =>
                          handleServiceAreaChange(
                            index,
                            "locality",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Koramangala"
                        className={`w-full px-3 py-2 bg-slate-800 border ${errors[`area_${index}_locality`] ? "border-red-500" : "border-slate-700"} rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                      {errors[`area_${index}_locality`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors[`area_${index}_locality`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-300 text-sm mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={area.city}
                        onChange={(e) =>
                          handleServiceAreaChange(index, "city", e.target.value)
                        }
                        placeholder="e.g., Bengaluru"
                        className={`w-full px-3 py-2 bg-slate-800 border ${errors[`area_${index}_city`] ? "border-red-500" : "border-slate-700"} rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                      {errors[`area_${index}_city`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors[`area_${index}_city`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-300 text-sm mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={area.state}
                        onChange={(e) =>
                          handleServiceAreaChange(
                            index,
                            "state",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Karnataka"
                        className={`w-full px-3 py-2 bg-slate-800 border ${errors[`area_${index}_state`] ? "border-red-500" : "border-slate-700"} rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                      {errors[`area_${index}_state`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors[`area_${index}_state`]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-slate-300 text-sm mb-1">
                      Priority
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleServiceAreaChange(index, "priority", 1)
                        }
                        className={`px-3 py-1.5 rounded-lg text-sm ${area.priority === 1 ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                      >
                        Priority 1 (Primary)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleServiceAreaChange(index, "priority", 2)
                        }
                        className={`px-3 py-1.5 rounded-lg text-sm ${area.priority === 2 ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                      >
                        Priority 2 (Backup)
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addServiceArea}
                className="w-full p-4 border-2 border-dashed border-slate-700 hover:border-slate-600 rounded-xl text-slate-400 hover:text-slate-300 transition-colors flex flex-col items-center justify-center"
              >
                <Plus className="w-6 h-6 mb-2" />
                Add Another Service Area
              </button>
            </div>
          </div>

          {/* Vehicle & Capacity */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Vehicle & Capacity
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-slate-300 mb-3">
                  Vehicle Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {vehicleOptions.map((vehicle) => (
                    <button
                      key={vehicle.value}
                      type="button"
                      onClick={() =>
                        handleInputChange("vehicleType", vehicle.value)
                      }
                      className={`p-4 rounded-xl border ${formData.vehicleType === vehicle.value ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-slate-900 hover:border-slate-600"} transition-colors`}
                    >
                      <div className="text-left">
                        <div className="font-medium text-white mb-1">
                          {vehicle.label}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-3">
                  Daily Capacity
                </label>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white">Maximum Tasks Per Day</span>
                    <span className="text-2xl font-bold text-blue-400">
                      {formData.maxTasksPerDay}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={formData.maxTasksPerDay}
                    onChange={(e) =>
                      handleNumberInputChange(e, "maxTasksPerDay")
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-slate-500 mt-2">
                    <span>1 task</span>
                    <span>25 tasks</span>
                    <span>50 tasks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Complete Setup</span>
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
