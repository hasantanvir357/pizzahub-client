'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth-session';
import { Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface MenuItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  status: string;
}

export default function ManageMenuPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchItems = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/admin/all`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (!ignore) setItems(data.items || data || []);
      }
      if (!ignore) setLoading(false);
    };
    fetchItems();
    return () => {
      ignore = true;
    };
  }, []);

  const handleApprove = async (id: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status: 'approved' }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((item) => (item._id === id ? { ...item, status: 'approved' } : item)));
      router.refresh();
      toast.success('Menu item approved!');
    } else {
      toast.error('Failed to approve menu item.');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item._id !== id));
      router.refresh();
      toast.success('Menu item removed.');
    } else {
      toast.error('Failed to remove menu item.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Approve Menus</h1>

      {loading ? (
        <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">No menu items to review.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Pizza</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item._id}>
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-11 h-11 rounded-lg object-cover" />
                    <span className="font-bold text-gray-900">{item.name}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{item.category}</td>
                  <td className="px-5 py-3.5 font-bold text-[#E20001]">${item.price}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                        item.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(item._id)}
                          className="flex items-center gap-1.5 rounded-lg bg-[#E20001] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#DB0007] transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 text-gray-400 hover:text-[#E20001]"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
