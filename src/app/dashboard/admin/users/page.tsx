// src/app/dashboard/admin/users/page.tsx
"use client";

import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import MessageToast from "@/components/dashboard/admin/messageToast";
import ConfirmDialog from "@/components/dashboard/admin/confirmDialog";
import { useAdminStore } from "@/store/adminStore";
import {
  Loader2,
  ChevronRight,
  Mail,
  MapPin,
  Calendar,
  Trash2,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  const {
    users,
    loading,
    updating,
    confirmDialog,
    fetchUsers,
    updateUserRole,
    deleteUser,
    hideConfirmDialog,
  } = useAdminStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Shield size={12} />
            Admin
          </span>
        );
      case "volunteer":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Volunteer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/30">
            User
          </span>
        );
    }
  };

  return (
    <DashboardLayout role="admin">
      <MessageToast />
      {confirmDialog?.isOpen && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={hideConfirmDialog}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link
            href="/dashboard/admin"
            className="hover:text-emerald-400 transition"
          >
            Dashboard
          </Link>
          <ChevronRight size={16} />
          <span className="text-white">Users</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            User Management
          </h2>
          <p className="text-slate-400">Manage user roles and permissions</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-emerald-400" size={40} />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <p className="text-slate-400">No users found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {user.name}
                      </h3>
                      {getRoleBadge(user.role)}
                    </div>
                    <div className="space-y-1 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <Mail size={14} />
                        {user.email}
                      </div>
                      {user.city && user.state && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          {user.city}, {user.state}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-400">
                      {user.points}
                    </p>
                    <p className="text-xs text-slate-500">Points</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    disabled={updating === user.id}
                    className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="user">User</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => deleteUser(user.id)}
                    disabled={updating === user.id}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {updating === user.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
