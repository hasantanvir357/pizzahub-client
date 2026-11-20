'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthUser, getToken, AuthUser } from '@/lib/auth-session';
import { BarChart3, DollarSign, ShoppingBag, Trash2, Utensils, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RecentOrder {
  _id: string;
  pizzaName: string;
  customerName: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

// Weekly platform analytics trend shown on every role's overview.
const platformAnalytics = [
  { day: 'Mon', orders: 42, revenue: 620 },
  { day: 'Tue', orders: 38, revenue: 540 },
  { day: 'Wed', orders: 51, revenue: 780 },
  { day: 'Thu', orders: 45, revenue: 690 },
  { day: 'Fri', orders: 68, revenue: 1040 },
  { day: 'Sat', orders: 74, revenue: 1180 },
  { day: 'Sun', orders: 59, revenue: 920 },
];

export default function DashboardOverviewPage() {
  const router = useRouter();
  // Reactive identity: re-read on auth changes so role/restaurant badges never
  // require a hard refresh after login or profile updates.
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearingHistory, setClearingHistory] = useState(false);

  useEffect(() => {
    const syncUser = () => setUser(getAuthUser());
    syncUser();
    window.addEventListener('auth-change', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('auth-change', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

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
        router.refresh();
        toast.success('Overview history cleared.');
      } else {
        toast.error('Failed to clear overview history.');
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
        router.refresh();
        toast.success('History log deleted.');
      } else {
        toast.error('Failed to delete history log.');
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

      {/* Platform & Order Analytics */}
      <Card className="border-0 bg-white shadow-xs ring-gray-100">
        <CardHeader className="border-b border-gray-100 px-6 py-5">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-[#E20001]">
              <BarChart3 className="w-4 h-4" />
            </span>
            Platform & Order Analytics
          </CardTitle>
          <CardDescription className="text-gray-500">
            Order volume and revenue across the last 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-5">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platformAnalytics} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E20001" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#E20001" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  dy={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  width={48}
                />
                <Tooltip
                  cursor={{ stroke: '#E20001', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #f3f4f6',
                    boxShadow: '0 8px 24px -8px rgba(0,0,0,0.12)',
                    fontSize: 12,
                  }}
                  labelStyle={{ fontWeight: 700, color: '#111827' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue ($)"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fill="url(#revenueFill)"
                  activeDot={{ r: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#E20001"
                  strokeWidth={2}
                  fill="url(#ordersFill)"
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-5 text-xs font-semibold text-gray-600">
            <span className="inline-flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E20001]" />
              Orders
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Revenue
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleClearHistory}
            disabled={clearingHistory}
            className="text-xs font-bold text-gray-600 hover:border-[#E20001] hover:text-[#E20001] hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {clearingHistory ? 'Clearing...' : 'Clear History'}
          </Button>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
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
                      <Badge variant="secondary" className="bg-red-50 text-[#E20001] border border-red-100 capitalize">
                        {order.status}
                      </Badge>
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
