'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth-session';

interface OrderItem {
  _id: string;
  pizzaName: string;
  restaurantName: string;
  size: string;
  quantity: number;
  totalPrice: number;
  status: string;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">My Orders</h1>

      {loading ? (
        <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-500">You have not placed any orders yet.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Pizza</th>
                <th className="px-5 py-3">Kitchen</th>
                <th className="px-5 py-3">Size & Qty</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{o.pizzaName}</td>
                  <td className="px-5 py-3.5 text-gray-600">{o.restaurantName}</td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {o.size} × {o.quantity}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-[#E20001]">${o.totalPrice}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-[#E20001] capitalize">
                      {o.status}
                    </span>
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
