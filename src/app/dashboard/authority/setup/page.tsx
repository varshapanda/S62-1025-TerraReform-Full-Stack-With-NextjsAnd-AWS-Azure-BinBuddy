// src/app/dashboard/authority/setup/page.tsx
"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import ProfileSetup, { FormData } from "@/components/authority/ProfileSetup";
import { useAuthorityStore } from "@/store/authorityStore";

export default function AuthoritySetupPage() {
  const router = useRouter();
  const { updateProfile } = useAuthorityStore();

  // This receives validated data from ProfileSetup.tsx
  const handleSubmit = async (data: FormData) => {
    const success = await updateProfile({
      baseLat: data.baseLat,
      baseLng: data.baseLng,
      city: data.city,
      state: data.state,
      serviceRadius: data.serviceRadius,
      vehicleType: data.vehicleType,
      maxTasksPerDay: data.maxTasksPerDay,
      serviceAreas: data.serviceAreas,
    });

    if (success) {
      router.push("/dashboard/authority");
    }

    return success;
  };

  return (
    <DashboardLayout role="authority">
      <ProfileSetup onSubmit={handleSubmit} />
    </DashboardLayout>
  );
}
