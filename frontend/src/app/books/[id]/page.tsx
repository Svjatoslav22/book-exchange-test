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
    return (
      <div className="mx-auto max-w-5xl animate-pulse rounded-2xl bg-white p-10 shadow-sm">
        <div className="h-80 rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || 'Книгу не знайдено'}
        </p>
        <Link
          href="/books"
          className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-burgundy"
        >
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Назад до каталогу
        </Link>
      </div>
    );
  }

  const photoSrc = getPhotoUrl(book.photoUrl);
  const isOwner = Boolean(user && user.id === book.ownerId);
  const isAdmin = user?.role === 'ADMIN';
  const ownerInitial = book.owner?.name ? book.owner.name.charAt(0).toUpperCase() : 'Ч';

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <Link
          href="/books"
          className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-burgundy"
        >
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Назад до каталогу
        </Link>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:flex-row">
        <div className="flex items-center justify-center bg-slate-50 p-6 md:w-2/5 md:p-10 lg:w-1/3">
          {photoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoSrc}
              alt={book.title}
              className="w-full max-w-[280px] rounded-lg object-cover shadow-xl shadow-slate-300/50"
            />
          ) : (
            <div className="flex aspect-[3/4] w-full max-w-[280px] flex-col items-center justify-center rounded-lg bg-slate-200/70 text-slate-400 shadow-inner">
              <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col p-6 md:w-3/5 md:p-10 lg:w-2/3">
          <div className="flex-grow">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Доступна для обміну
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Додано {new Date(book.createdAt).toLocaleDateString('uk-UA')}
              </span>
            </div>

            <h1 className="mb-2 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
              {book.title}
            </h1>
            <p className="mb-6 text-xl font-medium text-slate-600">{book.author}</p>

            {book.owner && (
              <div className="mb-8 flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-burgundy text-lg font-bold text-white shadow-sm">
                  {ownerInitial}
                </div>
                <div>
                  <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Власник книги
                  </p>
                  <p className="font-bold text-slate-900">{book.owner.name}</p>
                </div>
              </div>
            )}
          </div>

          {!isAuthLoading && (
            <div className="space-y-4 border-t border-slate-100 pt-6">
              {isOwner ? (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-6 py-3 text-center font-semibold text-slate-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>
                    Це ваша книга (
                    <Link href="/me/books" className="text-burgundy underline">
                      керувати у Моїх книгах
                    </Link>
                    )
                  </span>
                </div>
              ) : user ? (
                <form onSubmit={handleExchange} className="space-y-4">
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-1 block text-sm font-medium text-slate-700"
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
                      className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-burgundy focus:ring-2 focus:ring-burgundy/20"
                    />
                  </div>

                  {exchangeError && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                      {exchangeError}
                    </p>
                  )}

                  {exchangeResult && (
                    <div className="space-y-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      <p className="font-semibold">{exchangeResult.message}</p>
                      {exchangeResult.previewUrl && (
                        <a
                          href={exchangeResult.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block font-medium text-burgundy underline"
                        >
                          Переглянути надісланий лист (Ethereal) ↗
                        </a>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-burgundy px-6 py-3 text-center font-semibold text-white shadow-lg shadow-burgundy/20 transition-all hover:bg-burgundy-hover focus:ring-4 focus:ring-burgundy/20 disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    {isSending ? 'Надсилання...' : 'Запросити обмін'}
                  </button>
                </form>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-4 text-center text-sm text-slate-600">
                  Щоб запросити обмін, будь ласка,{' '}
                  <Link href="/login" className="font-semibold text-burgundy hover:underline">
                    увійдіть в акаунт
                  </Link>
                  .
                </div>
              )}

              {isAdmin && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleAdminDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
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
    <Suspense fallback={<p className="text-sm text-slate-500">Завантаження...</p>}>
      <BookDetailsContent />
    </Suspense>
  );
}