'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getPhotoUrl } from '@/lib/utils';
import type { Book, ExchangeResponse } from '@/types';

function BookDetailsContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [message, setMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [exchangeResult, setExchangeResult] = useState<ExchangeResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchBook = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<{ book: Book }>(`/books/${params.id}`);
        if (!isCancelled) {
          setBook(response.data.book);
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

    if (params.id) {
      fetchBook();
    }

    return () => {
      isCancelled = true;
    };
  }, [params.id]);

  const handleExchange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!book) return;

    setIsSending(true);
    setExchangeError(null);
    setExchangeResult(null);

    try {
      const trimmedMessage = message.trim();
      const response = await api.post<ExchangeResponse>(
        `/books/${book.id}/exchange`,
        trimmedMessage ? { message: trimmedMessage } : {}
      );
      setExchangeResult(response.data);
      setMessage('');
    } catch (err) {
      setExchangeError(getErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  const handleAdminDelete = async () => {
    if (!book) return;

    const isConfirmed = window.confirm(
      `Видалити книгу "${book.title}" як адміністратор?`
    );
    if (!isConfirmed) return;

    setIsDeleting(true);
    setExchangeError(null);

    try {
      await api.delete(`/admin/books/${book.id}`);
      router.push('/books');
    } catch (err) {
      setExchangeError(getErrorMessage(err));
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500">Завантаження...</p>;
  }

  if (error || !book) {
    return (
      <div className="space-y-4">
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error || 'Книгу не знайдено'}
        </p>
        <Link href="/books" className="text-sm font-medium text-gray-900 underline">
          ← Назад до каталогу
        </Link>
      </div>
    );
  }

  const photoSrc = getPhotoUrl(book.photoUrl);
  const isOwner = Boolean(user && user.id === book.ownerId);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <Link href="/books" className="inline-block text-sm text-gray-600 hover:text-gray-900">
        ← Назад до каталогу
      </Link>

      <div className="grid gap-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-[280px_1fr]">
        <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-gray-100">
          {photoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoSrc} alt={book.title} className="h-full w-full object-cover" />
          ) : (
            <span className="text-6xl">📖</span>
          )}
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
            <p className="text-lg text-gray-700">{book.author}</p>
            {book.owner && (
              <p className="text-sm text-gray-500">Власник: {book.owner.name}</p>
            )}
          </div>

          {!isAuthLoading && (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              {isOwner ? (
                <p className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700">
                  Це ваша книга. Ви можете керувати нею у розділі{' '}
                  <Link href="/me/books" className="font-medium text-gray-900 underline">
                    Мої книги
                  </Link>
                  .
                </p>
              ) : user ? (
                <form onSubmit={handleExchange} className="space-y-3">
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-1 block text-sm font-medium text-gray-900"
                    >
                      Повідомлення власнику (необовʼязково)
                    </label>
                    <textarea
                      id="message"
                      rows={3}
                      maxLength={500}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Напишіть, яку книгу пропонуєте на обмін..."
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
                    />
                  </div>

                  {exchangeError && (
                    <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                      {exchangeError}
                    </p>
                  )}

                  {exchangeResult && (
                    <div className="space-y-1 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
                      <p>{exchangeResult.message}</p>
                      {exchangeResult.previewUrl && (
                        <a
                          href={exchangeResult.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block font-medium underline"
                        >
                          Переглянути надісланий лист (Ethereal) ↗
                        </a>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSending}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    {isSending ? 'Надсилання...' : 'Запросити обмін'}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-gray-600">
                  Щоб запросити обмін, будь ласка,{' '}
                  <Link href="/login" className="font-medium text-gray-900 underline">
                    увійдіть в акаунт
                  </Link>
                  .
                </p>
              )}

              {isAdmin && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAdminDelete}
                    disabled={isDeleting}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {isDeleting ? 'Видалення...' : 'Видалити книгу (Адмін)'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookDetailsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Завантаження...</p>}>
      <BookDetailsContent />
    </Suspense>
  );
}