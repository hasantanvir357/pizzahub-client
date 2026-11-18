"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth-session";

interface KitchenOrder {
  _id: string;
  pizzaName: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  size: string;
  quantity: number;
  totalPrice: number;
  status: string;
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/vendor-orders`, {
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

  const updateStatus = async (id: string, status: string) => {
    const token = getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    setOrders((prev) =>
      status === "cancelled"
        ? // Cancelled orders leave the active table right away.
          prev.filter((o) => o._id !== id)
        : prev.map((o) => (o._id === id ? { ...o, status } : o))
    );
  };

  // Active table never shows cancelled orders (they stay in Overview history).
  const activeOrders = orders.filter((o) => o.status !== "cancelled");

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Customer Orders</h1>

      {loading ? (
        <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
      ) : activeOrders.length === 0 ? (
        <p className="text-sm text-gray-500">No incoming orders yet.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Order Item</th>
                <th className="px-5 py-3">Customer & Address</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeOrders.map((o) => (
                <tr key={o._id}>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-gray-900">{o.pizzaName}</p>
                    <p className="text-xs text-gray-500">
                      {o.size} × {o.quantity}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-600">
                    <p className="font-bold text-gray-800">{o.customerName}</p>
                    <p>{o.phone}</p>
                    <p className="truncate max-w-xs">{o.deliveryAddress}</p>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-[#E20001]">${o.totalPrice}</td>
                  <td className="px-5 py-3.5">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold capitalize focus:outline-none focus:border-[#E20001]"
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
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