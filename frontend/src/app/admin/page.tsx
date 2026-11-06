'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { AdminUser, Role } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add User Modal state
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newRole, setNewRole] = useState<Role>('USER');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Edit User Modal state
  const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editRole, setEditRole] = useState<Role>('USER');

  // Delete User Modal state
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    setError(null);

    try {
      const response = await api.get<{ users: AdminUser[] }>('/admin/users');
      setUsers(response.data.users);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

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

    fetchUsers();
  }, [isAuthLoading, user, router, fetchUsers]);

  const openAddModal = () => {
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('USER');
    setModalError(null);
    setIsAddOpen(true);
  };

  const openEditModal = (target: AdminUser) => {
    setUserToEdit(target);
    setEditName(target.name);
    setEditEmail(target.email);
    setEditRole(target.role);
    setModalError(null);
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setModalError(null);

    try {
      const response = await api.post<{ user: AdminUser }>('/admin/users', {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      });
      setUsers((prev) => [response.data.user, ...prev]);
      setIsAddOpen(false);
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userToEdit) return;

    setIsSaving(true);
    setModalError(null);

    try {
      const response = await api.patch<{ user: AdminUser }>(
        `/admin/users/${userToEdit.id}`,
        {
          name: editName,
          email: editEmail,
          role: editRole,
        }
      );
      setUsers((prev) =>
        prev.map((item) => (item.id === userToEdit.id ? response.data.user : item))
      );
      setUserToEdit(null);
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      setUsers((prev) => prev.filter((item) => item.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err) {
      setError(getErrorMessage(err));
      setUserToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

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

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white shadow-md transition-all hover:bg-slate-800"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          Додати користувача
        </button>
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
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    Завантаження...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    Користувачів не знайдено.
                  </td>
                </tr>
              ) : (
                users.map((item) => {
                  const initial = item.name ? item.name.charAt(0).toUpperCase() : 'U';
                  const isSelf = item.id === user.id;

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
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            title="Редагувати"
                            className="p-1.5 text-slate-400 transition-colors hover:text-burgundy"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => setUserToDelete(item)}
                              title="Видалити"
                              className="p-1.5 text-slate-400 transition-colors hover:text-red-500"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
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
            Показано {users.length > 0 ? `1–${users.length}` : 0} з {users.length}
          </span>
        </div>
      </div>

      {/* Modal: Add User */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !isSaving && setIsAddOpen(false)}
          />
          <div className="pointer-events-none flex min-h-screen items-center justify-center px-4 py-8">
            <div className="pointer-events-auto relative flex w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <h3 className="text-xl font-bold text-slate-900">Додати користувача</h3>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="text-slate-400 transition-colors hover:text-slate-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateUser}>
                <div className="space-y-4 p-6">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Ім&apos;я
                    </label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Марія Коваленко"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-burgundy focus:ring-2 focus:ring-burgundy/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="maria@example.com"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-burgundy focus:ring-2 focus:ring-burgundy/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Пароль
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Щонайменше 6 символів"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-burgundy focus:ring-2 focus:ring-burgundy/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Роль
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as Role)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-burgundy focus:ring-2 focus:ring-burgundy/20"
                    >
                      <option value="USER">Користувач</option>
                      <option value="ADMIN">Адміністратор</option>
                    </select>
                  </div>

                  {modalError && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                      {modalError}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50/50 p-6">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-800 disabled:opacity-50"
                  >
                    {isSaving ? 'Створення...' : 'Створити'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {userToEdit && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !isSaving && setUserToEdit(null)}
          />
          <div className="pointer-events-none flex min-h-screen items-center justify-center px-4 py-8">
            <div className="pointer-events-auto relative flex w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Редагувати користувача
                </h3>
                <button
                  type="button"
                  onClick={() => setUserToEdit(null)}
                  className="text-slate-400 transition-colors hover:text-slate-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateUser}>
                <div className="space-y-4 p-6">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Ім&apos;я
                    </label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-burgundy focus:ring-2 focus:ring-burgundy/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-burgundy focus:ring-2 focus:ring-burgundy/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Роль
                    </label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as Role)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-burgundy focus:ring-2 focus:ring-burgundy/20"
                    >
                      <option value="USER">Користувач</option>
                      <option value="ADMIN">Адміністратор</option>
                    </select>
                  </div>

                  {modalError && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                      {modalError}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50/50 p-6">
                  <button
                    type="button"
                    onClick={() => setUserToEdit(null)}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-lg bg-burgundy px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-burgundy-hover disabled:opacity-50"
                  >
                    {isSaving ? 'Збереження...' : 'Зберегти'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {userToDelete && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !isDeleting && setUserToDelete(null)}
          />
          <div className="pointer-events-none flex min-h-screen items-center justify-center px-4">
            <div className="pointer-events-auto w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">Ви впевнені?</h3>
              <p className="mb-6 text-sm text-slate-500">
                Користувача «{userToDelete.name}» та всі його книги буде видалено.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200 disabled:opacity-50"
                >
                  Скасувати
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteUser}
                  className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-red-500/20 transition-all hover:bg-red-600 disabled:opacity-50"
                >
                  {isDeleting ? 'Видалення...' : 'Видалити'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}