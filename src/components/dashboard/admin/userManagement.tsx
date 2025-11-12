"use client";

import { useState, useEffect } from "react";
import { User, Shield, AlertCircle, CheckCircle } from "lucide-react";

// Define TypeScript interfaces
interface UserType {
  id: number;
  name: string;
  email: string;
  role: string;
  points: number;
  state?: string;
  city?: string;
  createdAt: string;
}

interface MessageType {
  type: "success" | "error";
  text: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [message, setMessage] = useState<MessageType | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || data.data?.users || []);
      } else {
        showMessage("error", "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showMessage("error", "Error loading users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: number, newRole: string) => {
    setUpdating(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        showMessage("success", "Role updated successfully");
        fetchUsers(); // Refresh the list
      } else {
        const data = await response.json();
        showMessage("error", data.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      showMessage("error", "Error updating role");
    } finally {
      setUpdating(null);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

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
