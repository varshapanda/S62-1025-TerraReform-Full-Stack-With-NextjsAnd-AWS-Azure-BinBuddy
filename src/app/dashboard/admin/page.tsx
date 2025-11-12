import DashboardLayout from "@/components/dashboard/dashboardLayout";

export const metadata = {
  title: "Admin Dashboard - BinBuddy",
  description: "Admin dashboard for system management",
};

export default function AdminDashboardPage() {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Admin Dashboard
          </h2>
          <p className="text-slate-400">Manage the entire BinBuddy system</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-white">0</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">Total Reports</h3>
            <p className="text-3xl font-bold text-blue-400">0</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">Active Tasks</h3>
            <p className="text-3xl font-bold text-amber-400">0</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">System Health</h3>
            <p className="text-3xl font-bold text-emerald-400">100%</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Admin Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-left transition">
              <h4 className="text-purple-400 font-semibold mb-1">
                👥 Manage Users
              </h4>
              <p className="text-slate-400 text-sm">
                View and manage all users
              </p>
            </button>
            <button className="p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-left transition">
              <h4 className="text-red-400 font-semibold mb-1">
                📊 View Reports
              </h4>
              <p className="text-slate-400 text-sm">
                Monitor all system reports
              </p>
            </button>
            <button className="p-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-left transition">
              <h4 className="text-amber-400 font-semibold mb-1">
                ⚙️ System Settings
              </h4>
              <p className="text-slate-400 text-sm">
                Configure system parameters
              </p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
