import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Сервіс обміну книгами',
  description: 'Знайдіть цікаву книгу та запропонуйте свою натомість',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body
        className={`${inter.className} flex min-h-screen flex-col bg-cream text-slate-800 antialiased`}
      >
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto max-w-6xl flex-grow px-4 py-8 md:py-12">
            {children}
          </main>
          <footer className="mt-auto border-t border-slate-200 bg-white py-8">
            <div className="container mx-auto max-w-6xl px-4 text-center">
              <div className="mb-3 flex items-center justify-center gap-2">
                <svg
                  className="h-6 w-6 text-burgundy"
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
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  BookXhange-insiders
                </span>
              </div>
              <p className="text-sm text-slate-500">
                © 2026 Сервіс обміну книгами. Всі права захищено.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}