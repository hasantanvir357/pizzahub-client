'use client';

import { useEffect, useState } from 'react';
import { getAuthUser, getToken } from '@/lib/auth-session';
import { DollarSign, ShoppingBag, Trash2, Utensils, Users } from 'lucide-react';

interface RecentOrder {
  _id: string;
  pizzaName: string;
  customerName: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function DashboardOverviewPage() {
  const user = getAuthUser();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearingHistory, setClearingHistory] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats || {});
          setRecentOrders(data.recentOrders || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleClearHistory = async () => {
    const token = getToken();
    if (!token) return;
    setClearingHistory(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/history`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRecentOrders([]);
      }
    } finally {
      setClearingHistory(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRecentOrders((prev) => prev.filter((o) => o._id !== id));
      }
    } catch {
      // Ignore transient failures; the overview list stays as-is.
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-sm text-gray-500 mt-1">Here is your live {user?.role} activity overview.</p>
      </div>

      {/* Role-Specific Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {user?.role === 'admin' && (
          <>
            <StatCard title="Total Revenue" value={`$${stats.totalRevenue || 0}`} icon={DollarSign} />
            <StatCard title="Total Orders" value={stats.totalOrders || 0} icon={ShoppingBag} />
            <StatCard title="Total Pizzas" value={stats.totalMenus || 0} icon={Utensils} />
            <StatCard title="Registered Users" value={stats.totalUsers || 0} icon={Users} />
          </>
        )}

        {user?.role === 'vendor' && (
          <>
            <StatCard title="Kitchen Earnings" value={`$${stats.totalEarnings || 0}`} icon={DollarSign} />
            <StatCard title="Total Orders" value={stats.totalOrders || 0} icon={ShoppingBag} />
            <StatCard title="Pending Orders" value={stats.pendingOrders || 0} icon={ShoppingBag} />
            <StatCard title="My Menu Items" value={stats.myMenus || 0} icon={Utensils} />
          </>
        )}

        {user?.role === 'customer' && (
          <>
            <StatCard title="Total Orders" value={stats.totalOrders || 0} icon={ShoppingBag} />
            <StatCard title="Active Orders" value={stats.activeOrders || 0} icon={Utensils} />
            <StatCard title="Total Spent" value={`$${stats.totalSpent || 0}`} icon={DollarSign} />
          </>
        )}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
          <button
            type="button"
            onClick={handleClearHistory}
            disabled={clearingHistory}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:border-[#E20001] hover:text-[#E20001] hover:bg-red-50 transition-all duration-300 ease-out disabled:opacity-60"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {clearingHistory ? 'Clearing...' : 'Clear History'}
          </button>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">Pizza</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-3.5 font-semibold text-gray-900">{order.pizzaName}</td>
                    <td className="px-6 py-3.5 text-gray-600">{order.customerName}</td>
                    <td className="px-6 py-3.5 font-bold text-[#E20001]">${order.totalPrice}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-[#E20001] capitalize">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteOrder(order._id)}
                        aria-label={`Delete order history ${order._id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-[#E20001] hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 text-sm text-gray-500">No recent orders found yet.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase">{title}</p>
        <p className="text-2xl font-extrabold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="w-11 h-11 rounded-xl bg-red-50 text-[#E20001] flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}
