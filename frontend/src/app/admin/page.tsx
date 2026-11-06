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
    return <p className="text-sm text-slate-500">Завантаження...</p>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Панель адміністратора
          </h1>
          <p className="mt-1 text-slate-500">
            Управління користувачами платформи
          </p>
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Користувач</th>
                <th className="px-6 py-4">Роль</th>
                <th className="px-6 py-4">Книги</th>
                <th className="px-6 py-4">Реєстрація</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                    Завантаження...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                    Користувачів не знайдено.
                  </td>
                </tr>
              ) : (
                users.map((item) => {
                  const initial = item.name ? item.name.charAt(0).toUpperCase() : 'U';

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                              item.role === 'ADMIN' ? 'bg-burgundy' : 'bg-slate-800'
                            }`}
                          >
                            {initial}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.role === 'ADMIN' ? (
                          <span className="rounded-full border border-burgundy/20 bg-burgundy/10 px-2.5 py-1 text-xs font-bold text-burgundy">
                            Admin
                          </span>
                        ) : (
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {item._count.books}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString('uk-UA', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <span className="text-sm text-slate-500">
            Всього користувачів: {users.length}
          </span>
        </div>
      </div>
    </div>
  );
}