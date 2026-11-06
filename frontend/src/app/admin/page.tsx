'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { AdminUser } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'ADMIN') {
      router.replace('/books');
      return;
    }

    let isCancelled = false;

    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<{ users: AdminUser[] }>('/admin/users');
        if (!isCancelled) {
          setUsers(response.data.users);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isCancelled = true;
    };
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || !user || user.role !== 'ADMIN') {
    return <p className="text-sm text-gray-500">Завантаження...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Адмін-панель: Користувачі</h1>
        <span className="text-sm text-gray-600">Всього: {users.length}</span>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">Завантаження...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-gray-500">Користувачів не знайдено.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">Імʼя</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Роль</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Книг</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Дата реєстрації</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-gray-700">{item.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        item.role === 'ADMIN'
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{item._count.books}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString('uk-UA')}
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