"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboardLayout";

export default function ReportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    category: "WET",
    note: "",
    lat: 0,
    lng: 0,
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Get geolocation
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));
        setError("");
      },
      () => {
        setError("Failed to get location");
      }
    );
  };

  // Submit report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!file) {
        throw new Error("Please select a file");
        s;
      }

      if (formData.lat === 0 || formData.lng === 0) {
        throw new Error("Please set location");
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

      console.log("Step 2: Upload URL received:", uploadUrl);
      console.log("Step 2: Uploading file to S3...");

      // Step 2: Upload to S3 using presigned URL
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        console.error("Upload failed:", uploadRes.status, uploadRes.statusText);
        throw new Error(`File upload failed: ${uploadRes.status}`);
      }

      console.log("Step 3: File uploaded successfully to S3");

      // Step 3: Extract S3 key from presigned URL
      // Presigned URL format: https://bucket.s3.region.amazonaws.com/reports/timestamp-filename?signed-params
      const presignedUrlObj = new URL(uploadUrl);
      const s3Key = presignedUrlObj.pathname.substring(1); // Remove leading /

      console.log("S3 Key:", s3Key);

      // Construct public image URL
      const imageUrl = `${process.env.NEXT_PUBLIC_S3_URL}/${s3Key}`;

      console.log("Step 4: Image URL:", imageUrl);
      console.log("Step 4: Creating report in database...");

      // Step 4: Create report in DB
      const reportRes = await fetch("/api/reports/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          category: formData.category,
          note: formData.note || undefined,
          lat: formData.lat,
          lng: formData.lng,
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

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Report Waste</h2>
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

        <div className="space-y-6">
          {/* File Upload */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <label className="block text-white font-semibold mb-3">
              Upload Photo *
            </label>

            {preview ? (
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-lg"
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
                className="w-full p-8 border-2 border-dashed border-slate-600 hover:border-emerald-500 rounded-lg transition text-slate-400 hover:text-emerald-400"
              >
                📸 Click to upload or drag image here
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
            <label className="block text-white font-semibold mb-3">
              Waste Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:border-emerald-500 outline-none"
            >
              <option value="WET">Wet Waste (Food, Garden)</option>
              <option value="DRY">Dry Waste (Paper, Plastic)</option>
              <option value="MIXED">Mixed Waste</option>
              <option value="HAZARDOUS">Hazardous</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Location */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <label className="block text-white font-semibold mb-3">
              Location *
            </label>
            <div className="space-y-3">
              <button
                onClick={handleGeolocate}
                className="w-full p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg transition"
              >
                📍 Auto-detect Location
              </button>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={formData.lat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lat: parseFloat(e.target.value),
                    })
                  }
                  placeholder="Latitude"
                  step="0.000001"
                  className="p-3 bg-slate-700 border border-slate-600 text-white rounded-lg outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  value={formData.lng}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lng: parseFloat(e.target.value),
                    })
                  }
                  placeholder="Longitude"
                  step="0.000001"
                  className="p-3 bg-slate-700 border border-slate-600 text-white rounded-lg outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <label className="block text-white font-semibold mb-3">
              Additional Notes
            </label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              placeholder="Any additional details..."
              maxLength={500}
              className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg outline-none focus:border-emerald-500"
              rows={4}
            />
            <p className="text-slate-500 text-sm mt-2">
              {formData.note.length}/500
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full p-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded-lg transition"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
