import DashboardLayout from "@/components/dashboard/dashboardLayout";
import UserManagement from "@/components/dashboard/admin/userManagement";

export const metadata = {
  title: "User Management - BinBuddy Admin",
  description: "Manage user roles and permissions",
};

export default function AdminUsersPage() {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            User Management
          </h2>
          <p className="text-slate-400">Manage user roles and permissions</p>
        </div>

        <UserManagement />
      </div>
    </DashboardLayout>
  );
}
