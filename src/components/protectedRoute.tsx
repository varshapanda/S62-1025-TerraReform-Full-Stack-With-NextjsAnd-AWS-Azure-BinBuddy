"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const hasRole = useAuthStore((state) => state.hasRole);
  const getDashboardRoute = useAuthStore((state) => state.getDashboardRoute);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Fetch user data from API if not already loaded
    if (!user && !isLoading) {
      fetchUser();
    }
  }, [user, isLoading, fetchUser]);

  useEffect(() => {
    // Wait for user data to load
    if (isLoading) return;

    // Check authentication
    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login...");
      router.push("/login");
      return;
    }

    // Check role authorization
    if (allowedRoles && !hasRole(allowedRoles)) {
      console.log("Unauthorized role, redirecting to dashboard...");
      const dashboardPath = getDashboardRoute();
      router.push(dashboardPath);
      return;
    }
  }, [
    isAuthenticated,
    hasRole,
    allowedRoles,
    router,
    getDashboardRoute,
    isLoading,
  ]);

  // Show loading while checking auth or fetching user
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Check role authorization
  if (allowedRoles && !hasRole(allowedRoles)) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
