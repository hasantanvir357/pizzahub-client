'use client';

import { useEffect, useState } from 'react';
import { ShieldBan } from 'lucide-react';
import { AuthUser, getAuthUser, getToken } from '@/lib/auth-session';

type UserRole = 'customer' | 'vendor' | 'admin';

interface ManagedUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isBlocked?: boolean;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setCurrentUser(getAuthUser());
  }, []);

  useEffect(() => {
    let ignore = false;
    const fetchUsers = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (!ignore) setUsers(data.users || data || []);
      }
      if (!ignore) setLoading(false);
    };
    fetchUsers();
    return () => {
      ignore = true;
    };
  }, []);

  // Blocked accounts live in the dedicated "Blocked Users" panel.
  const activeUsers = users.filter((user) => !user.isBlocked);

  // The logged-in admin can never demote or block themselves.
  const isSelf = (user: ManagedUser) =>
    user._id === currentUser?._id || user.email === currentUser?.email;

  const handleRoleChange = async (id: string, role: UserRole) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ role }),
    });
    if (res.ok) setUsers((prev) => prev.map((user) => (user._id === id ? { ...user, role } : user)));
  };

  const handleBlock = async (id: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/block`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ isBlocked: true }),
    });
    if (res.ok) setUsers((prev) => prev.map((user) => (user._id === id ? { ...user, isBlocked: true } : user)));
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Manage Users</h1>

      {loading ? (
        <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
      ) : activeUsers.length === 0 ? (
        <p className="text-sm text-gray-500">No active users found.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto transition-all duration-300 ease-out hover:shadow-md hover:border-red-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeUsers.map((user) => (
                <tr
                  key={user._id}
                  className="transition-all duration-300 ease-out hover:bg-red-50/40"
                >
                  <td className="px-5 py-3.5 font-bold text-gray-900">{user.name}</td>
                  <td className="px-5 py-3.5 text-gray-600">{user.email}</td>
                  <td className="px-5 py-3.5">
                    {isSelf(user) ? (
                      <span className="font-bold capitalize text-gray-700">{user.role}</span>
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value as UserRole)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 transition-all duration-300 ease-out focus:border-[#E20001] focus:outline-none"
                      >
                        <option value="customer">customer</option>
                        <option value="vendor">vendor</option>
                        <option value="admin">admin</option>
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {isSelf(user) ? (
                      <span className="inline-block rounded-full bg-[#E20001] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                        You (Protected)
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBlock(user._id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#E20001] px-3 py-1.5 text-xs font-bold text-white transition-all duration-300 ease-out hover:bg-[#DB0007] hover:shadow-sm"
                      >
                        <ShieldBan className="w-3.5 h-3.5" /> Block
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
