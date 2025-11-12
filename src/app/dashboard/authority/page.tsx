import DashboardLayout from "@/components/dashboard/dashboardLayout";

export const metadata = {
  title: "Authority Dashboard - BinBuddy",
  description: "Authority dashboard for task management",
};

export default function AuthorityDashboardPage() {
  return (
    <DashboardLayout role="authority">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Authority Dashboard
          </h2>
          <p className="text-slate-400">
            Manage tasks and waste collection operations
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">Active Tasks</h3>
            <p className="text-3xl font-bold text-blue-400">0</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">Completed Today</h3>
            <p className="text-3xl font-bold text-emerald-400">0</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">Pending Assignment</h3>
            <p className="text-3xl font-bold text-amber-400">0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Authority Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-left transition">
              <h4 className="text-blue-400 font-semibold mb-1">
                📅 Schedule Tasks
              </h4>
              <p className="text-slate-400 text-sm">
                Create and assign collection tasks
              </p>
            </button>
            <button className="p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-left transition">
              <h4 className="text-emerald-400 font-semibold mb-1">
                ✓ Complete Tasks
              </h4>
              <p className="text-slate-400 text-sm">Mark tasks as completed</p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
