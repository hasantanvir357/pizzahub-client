'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth-session';
import { Trash2 } from 'lucide-react';

interface VendorMenu {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  status: string;
}

export default function MyMenuPage() {
  const [items, setItems] = useState<VendorMenu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchItems = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/vendor/my-items`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (!ignore) setItems(data.items || []);
      }
      if (!ignore) setLoading(false);
    };
    fetchItems();
    return () => {
      ignore = true;
    };
  }, []);

  const handleDelete = async (id: string) => {
    const token = getToken();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems((prev) => prev.filter((item) => item._id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">My Menu Items</h1>

      {loading ? (
        <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">You haven&apos;t added any pizzas yet.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Pizza</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
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
                    <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-[#E20001]">
                      <Trash2 className="w-4 h-4" />
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
