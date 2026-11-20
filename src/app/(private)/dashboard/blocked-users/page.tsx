'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { getToken } from '@/lib/auth-session';
import { toast } from 'sonner';

type UserRole = 'customer' | 'vendor' | 'admin';

interface BlockedUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isBlocked?: boolean;
}

export default function BlockedUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchBlockedUsers = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        const all: BlockedUser[] = data.users || data || [];
        if (!ignore) setUsers(all.filter((user) => user.isBlocked === true));
      }
      if (!ignore) setLoading(false);
    };
    fetchBlockedUsers();
    return () => {
      ignore = true;
    };
  }, []);

  const handleUnblock = async (id: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/block`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ isBlocked: false }),
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((user) => user._id !== id));
      router.refresh();
      toast.success('User unblocked.');
    } else {
      toast.error('Failed to unblock user.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Blocked Users</h1>

      {loading ? (
        <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
      ) : users.length === 0 ? (
        <p className="text-sm text-gray-500">No blocked users.</p>
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
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="transition-all duration-300 ease-out hover:bg-red-50/40"
                >
                  <td className="px-5 py-3.5 font-bold text-gray-900">{user.name}</td>
                  <td className="px-5 py-3.5 text-gray-600">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="capitalize font-bold text-gray-700">{user.role}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleUnblock(user._id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#E20001] px-3 py-1.5 text-xs font-bold text-[#E20001] transition-all duration-300 ease-out hover:bg-[#E20001] hover:text-white hover:shadow-sm"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Unblock
                    </button>
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
