'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    router.push('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-cream/90 shadow-sm backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/books" className="group flex items-center gap-2">
          <svg
            className="h-8 w-8 text-burgundy transition-colors group-hover:text-burgundy-hover"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            BookXhange-insiders
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/books"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-burgundy"
          >
            Книги
          </Link>
          {user && (
            <Link
              href="/me/books"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-burgundy"
            >
              Мої книги
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-burgundy"
            >
              Адмінка
            </Link>
          )}

          <div className="mx-1 h-6 w-px bg-slate-300" />

          {isLoading ? (
            <span className="h-8 w-28 animate-pulse rounded-lg bg-slate-200" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-burgundy text-xs font-bold text-white">
                  {userInitial}
                </span>
                <span>{user.name}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Вийти"
                className="text-slate-500 transition-colors hover:text-red-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 transition-colors hover:text-burgundy"
              >
                Увійти
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-burgundy-hover"
              >
                Реєстрація
              </Link>
            </div>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="p-2 text-slate-600 transition-colors hover:text-burgundy md:hidden"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white shadow-lg md:hidden">
          <div className="flex flex-col space-y-4 p-4">
            <Link
              href="/books"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-medium text-slate-700 hover:text-burgundy"
            >
              Книги
            </Link>
            {user && (
              <Link
                href="/me/books"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-medium text-slate-700 hover:text-burgundy"
              >
                Мої книги
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-medium text-slate-700 hover:text-burgundy"
              >
                Адмінка
              </Link>
            )}
            <hr className="border-slate-100" />
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="text-left font-medium text-slate-500 hover:text-red-600"
              >
                Вийти ({user.name})
              </button>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-medium text-slate-700 hover:text-burgundy"
                >
                  Увійти
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-block rounded-lg bg-burgundy px-4 py-2 text-center text-sm font-medium text-white hover:bg-burgundy-hover"
                >
                  Реєстрація
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}