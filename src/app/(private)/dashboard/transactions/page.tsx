'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth-session';
import { BadgeDollarSign, Lock, ReceiptText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  _id: string;
  type?: string;
  method?: string;
  amount: number;
  currency?: string;
  status?: string;
  description?: string;
  date?: string;
  createdAt?: string;
}

function formatDate(value?: string) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const fetchTransactions = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load transactions.');
        }
        const list = data.transactions || data.data || [];
        if (!ignore) setTransactions(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : 'Failed to load transactions.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchTransactions();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">Platform-wide payment activity and settlement records.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start px-3.5 py-2 rounded-xl bg-gray-100 text-xs font-bold text-gray-600">
          <Lock className="w-3.5 h-3.5" />
          Read-only view
        </span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <SummaryCard title="Total Transactions" value={String(transactions.length)} />
        <SummaryCard title="Total Volume" value={`$${sum(transactions)}`} />
        <SummaryCard title="Completed" value={String(countStatus(transactions, 'succeeded') || countStatus(transactions, 'completed'))} />
      </div>

      {/* Read-only Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Transaction History</h2>
          <span className="text-xs font-semibold text-gray-400 inline-flex items-center gap-1.5">
            <ReceiptText className="w-3.5 h-3.5" />
            Admin-only
          </span>
        </div>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">Transaction</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-gray-900">
                      {tx.description || `Transaction ${tx._id.slice(-6).toUpperCase()}`}
                    </td>
                    <td className="px-6 py-3.5 text-gray-600 capitalize">{tx.type || 'payment'}</td>
                    <td className="px-6 py-3.5 text-gray-600">{tx.method || 'Card'}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1 font-bold text-[#E20001]">
                        <BadgeDollarSign className="w-3.5 h-3.5" />
                        ${(Number(tx.amount) || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 border border-emerald-100 capitalize"
                      >
                        {tx.status || 'completed'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-gray-600">{formatDate(tx.date || tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 text-sm text-gray-500">No transactions recorded yet.</p>
        )}
      </div>

      {error && (
        <p className="mt-6 text-center text-sm font-semibold text-[#E20001]">
          {error}
        </p>
      )}
    </div>
  );
}

function sum(list: Transaction[]) {
  const total = list.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
  return total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function countStatus(list: Transaction[], status: string) {
  return list.filter((tx) => (tx.status || '').toLowerCase() === status).length;
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
      <p className="text-xs font-bold text-gray-400 uppercase">{title}</p>
      <p className="text-2xl font-extrabold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
