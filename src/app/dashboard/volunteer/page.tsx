import DashboardLayout from "@/components/dashboard/dashboardLayout";

export const metadata = {
  title: "Volunteer Dashboard - BinBuddy",
  description: "Volunteer dashboard for report verification",
};

export default function VolunteerDashboardPage() {
  return (
    <DashboardLayout role="volunteer">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Volunteer Dashboard
          </h2>
          <p className="text-slate-400">
            Verify reports and help maintain quality
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">
              Pending Verification
            </h3>
            <p className="text-3xl font-bold text-amber-400">0</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">Verified Today</h3>
            <p className="text-3xl font-bold text-emerald-400">0</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm mb-2">Total Verified</h3>
            <p className="text-3xl font-bold text-white">0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Volunteer Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-left transition">
              <h4 className="text-amber-400 font-semibold mb-1">
                ✓ Verify Reports
              </h4>
              <p className="text-slate-400 text-sm">Review pending reports</p>
            </button>
            <button className="p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-left transition">
              <h4 className="text-purple-400 font-semibold mb-1">
                📊 Verification History
              </h4>
              <p className="text-slate-400 text-sm">
                View your verification record
              </p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
