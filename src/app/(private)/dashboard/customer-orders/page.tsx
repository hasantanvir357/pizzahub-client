"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth-session";
import { toast } from "sonner";

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
    if (!res.ok) {
      toast.error("Failed to update order status.");
      return;
    }
    toast.success("Order status updated!");
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
        <>
          {/* Mobile: stacked order cards (no horizontal overflow) */}
          <div className="md:hidden space-y-3">
            {activeOrders.map((o) => (
              <div
                key={o._id}
                className="bg-white rounded-2xl border border-neutral-200/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-900">{o.pizzaName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {o.size} × {o.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-[#E20001] shrink-0">${o.totalPrice}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-200/80 space-y-0.5 text-xs text-gray-600">
                  <p className="font-bold text-gray-800">{o.customerName}</p>
                  <p>{o.phone}</p>
                  <p className="break-words">{o.deliveryAddress}</p>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-[#E20001] capitalize">
                    {o.status}
                  </span>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    aria-label={`Update status for ${o.pizzaName}`}
                    className="flex-1 px-3 py-2 rounded-lg border border-neutral-200/80 text-xs font-bold capitalize focus:outline-none focus:border-[#E20001]"
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table with horizontal scroll guard */}
          <div className="hidden md:block bg-white rounded-2xl border border-neutral-200/80 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
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
                        className="px-3 py-1.5 rounded-lg border border-neutral-200/80 text-xs font-bold capitalize focus:outline-none focus:border-[#E20001]"
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
        </>
      )}
    </div>
  );
}