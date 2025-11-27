"use client";

import { useEffect } from "react";
import { User, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { useAdminStore } from "@/store/adminStore";

export default function UserManagement() {
  const { users, loading, updating, message, fetchUsers, updateUserRole } =
    useAdminStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      user: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      volunteer: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      authority: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      admin: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    };
    return colors[role.toLowerCase()] || colors.user;
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
        <p className="text-slate-400">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Message Alert */}
      {message && (
        <div
          className={`p-4 rounded-lg border flex items-center gap-3 ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* User List */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-600">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Points
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Current Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Change Role
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-700 rounded-lg">
                        <User size={20} className="text-slate-400" />
                      </div>
                      <span className="text-white font-medium">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{user.email}</td>
                  <td className="px-6 py-4 text-white">{user.points}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      <Shield size={12} />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      disabled={updating === user.id}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed capitalize"
                    >
                      <option value="user">User</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="authority">Authority</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
          <p className="text-slate-400">No users found</p>
        </div>
      )}
    </div>
  );
}
