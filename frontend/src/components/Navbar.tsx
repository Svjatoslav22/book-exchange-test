'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/books" className="text-lg font-bold text-gray-900">
            BookXhange-insiders
          </Link>
          <Link href="/books" className="text-sm text-gray-600 hover:text-gray-900">
            Книги
          </Link>
          {user && (
            <Link href="/me/books" className="text-sm text-gray-600 hover:text-gray-900">
              Мої книги
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
              Адмінка
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <span className="h-5 w-24 animate-pulse rounded bg-gray-200" />
          ) : user ? (
            <>
              <span className="text-sm text-gray-700">{user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
              >
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-700 hover:text-gray-900">
                Увійти
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
              >
                Реєстрація
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}