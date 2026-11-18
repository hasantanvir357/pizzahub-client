'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth-session';

type UserRole = 'customer' | 'vendor' | 'admin';

interface ManagedUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Manage Users</h1>

      {loading ? (
        <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
      ) : users.length === 0 ? (
        <p className="text-sm text-gray-500">No users found.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{user.name}</td>
                  <td className="px-5 py-3.5 text-gray-600">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value as UserRole)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 focus:border-[#E20001] focus:outline-none"
                    >
                      <option value="customer">customer</option>
                      <option value="vendor">vendor</option>
                      <option value="admin">admin</option>
                    </select>
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
