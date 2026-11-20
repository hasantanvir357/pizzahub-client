'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { getToken } from '@/lib/auth-session';
import { toast } from 'sonner';

interface OrderItem {
  _id: string;
  pizzaName: string;
  restaurantName: string;
  size: string;
  quantity: number;
  totalPrice: number;
  status: string;
  cancelReason?: string;
}

const CANCEL_REASONS = [
  'Ordered by mistake',
  'Changed delivery address',
  'Delivery time too long',
  'Other',
];

/** The API may return "Pending" or "pending" — accept both casings. */
const isPending = (status?: string) => (status ?? '').trim().toLowerCase() === 'pending';
const isCancelled = (status?: string) => (status ?? '').trim().toLowerCase() === 'cancelled';

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancel modal state
  const [cancelTarget, setCancelTarget] = useState<OrderItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNote, setCancelNote] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Cancelled orders are hidden from the customer's order list.
        setOrders((data.orders || []).filter((o: OrderItem) => !isCancelled(o.status)));
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  // Close the modal with Escape.
  useEffect(() => {
    if (!cancelTarget) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCancelTarget(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cancelTarget]);

  const openCancelModal = (order: OrderItem) => {
    setCancelTarget(order);
    setCancelReason('');
    setCancelNote('');
    setConfirmChecked(false);
    setModalError('');
  };

  const closeCancelModal = () => {
    setCancelTarget(null);
    setModalError('');
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTarget) return;

    if (!cancelReason) {
      setModalError('Please select a reason for cancelling this order.');
      return;
    }
    if (!confirmChecked) {
      setModalError('Please confirm that you want to cancel this order.');
      return;
    }

    setSubmitting(true);
    setModalError('');

    try {
      const finalReason = cancelNote.trim() ? `${cancelReason} — ${cancelNote.trim()}` : cancelReason;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${cancelTarget._id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ cancelReason: finalReason }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({} as { message?: string }));
        throw new Error(data.message || 'Failed to cancel order');
      }

      // Cancelled orders are removed from the list immediately.
      setOrders((prev) => prev.filter((order) => order._id !== cancelTarget._id));
      closeCancelModal();
      router.refresh();
      toast.success('Order cancelled.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel order';
      setModalError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">My Orders</h1>

      {loading ? (
        <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-500">You have not placed any orders yet.</p>
      ) : (
        <>
          {/* Mobile: stacked order cards (no horizontal overflow) */}
          <div className="md:hidden space-y-3">
            {orders.map((o) => (
              <div
                key={o._id}
                className="bg-white rounded-2xl border border-neutral-200/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{o.pizzaName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{o.restaurantName}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-[#E20001] capitalize shrink-0">
                    {o.status}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-neutral-200/80">
                  <span className="text-xs font-semibold text-gray-600">
                    {o.size} × {o.quantity}
                  </span>
                  <span className="text-base font-extrabold text-[#E20001]">${o.totalPrice}</span>
                </div>
                {isPending(o.status) && (
                  <button
                    type="button"
                    onClick={() => openCancelModal(o)}
                    className="mt-3 w-full rounded-xl border border-[#E20001] px-3 py-2 text-xs font-bold text-[#E20001] transition-all duration-300 hover:bg-[#E20001] hover:text-white active:scale-[0.98]"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: table with horizontal scroll guard */}
          <div className="hidden md:block bg-white rounded-2xl border border-neutral-200/80 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
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
                  <tr key={o._id} className="transition-all duration-300 ease-out hover:bg-red-50/40">
                    <td className="px-5 py-3.5 font-bold text-gray-900">{o.pizzaName}</td>
                    <td className="px-5 py-3.5 text-gray-600">{o.restaurantName}</td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {o.size} × {o.quantity}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[#E20001]">${o.totalPrice}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-[#E20001] capitalize">
                          {o.status}
                        </span>
                        {isPending(o.status) && (
                          <button
                            type="button"
                            onClick={() => openCancelModal(o)}
                            className="rounded-lg border border-[#E20001] px-2.5 py-1 text-[11px] font-bold text-[#E20001] transition-all duration-300 ease-out hover:bg-[#E20001] hover:text-white active:scale-[0.98]"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Cancellation Check Modal */}
      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closeCancelModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-order-title"
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="cancel-order-title" className="text-lg font-extrabold text-gray-900">
                  Cancel Order
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {cancelTarget.pizzaName} · {cancelTarget.restaurantName}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCancelModal}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="mt-5 space-y-4">
              {/* Reason */}
              <div>
                <label htmlFor="cancel-reason" className="block text-xs font-bold text-gray-700 mb-1">
                  Why are you cancelling? *
                </label>
                <select
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#E20001]"
                >
                  <option value="">Select a reason</option>
                  {CANCEL_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Note */}
              <div>
                <label htmlFor="cancel-note" className="block text-xs font-bold text-gray-700 mb-1">
                  Additional note (optional)
                </label>
                <textarea
                  id="cancel-note"
                  rows={3}
                  value={cancelNote}
                  onChange={(e) => setCancelNote(e.target.value)}
                  placeholder="Anything else we should know?"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#E20001] resize-none"
                />
              </div>

              {/* Confirmation */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#E20001]"
                />
                <span className="text-xs text-gray-600">
                  I understand this order cannot be recovered once cancelled.
                </span>
              </label>

              {modalError && (
                <p className="text-xs font-semibold text-[#E20001]">{modalError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeCancelModal}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 transition-all duration-300 ease-out hover:bg-gray-50"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#E20001] hover:bg-[#DB0007] text-white text-xs font-bold transition-all duration-300 ease-out disabled:opacity-60"
                >
                  {submitting ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
