'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getPhotoUrl } from '@/lib/utils';
import { bookSchema, type BookFormValues } from '@/lib/validations/book';
import type { Book } from '@/types';

const inputClassName =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none';

export default function MyBooksPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listError, setListError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: { title: '', author: '' },
  });

  const fetchBooks = useCallback(async () => {
    setListError(null);

    try {
      const response = await api.get<{ books: Book[] }>('/me/books');
      setBooks(response.data.books);
    } catch (error) {
      setListError(getErrorMessage(error));
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

    fetchBooks();
  }, [isAuthLoading, user, router, fetchBooks]);

  const onSubmit = async (values: BookFormValues) => {
    setFormError(null);

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('author', values.author);

    if (values.photo && values.photo.length > 0) {
      formData.append('photo', values.photo[0]);
    }

    try {
      await api.post('/me/books', formData);
      reset();
      await fetchBooks();
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  const handleDelete = async (book: Book) => {
    const isConfirmed = window.confirm(`Видалити книгу "${book.title}"?`);

    if (!isConfirmed) {
      return;
    }

    setDeletingId(book.id);
    setListError(null);

    try {
      await api.delete(`/me/books/${book.id}`);
      setBooks((current) => current.filter((item) => item.id !== book.id));
    } catch (error) {
      setListError(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  if (isAuthLoading || !user) {
    return <p className="text-sm text-gray-500">Завантаження...</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Мої книги</h1>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Додати книгу</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium">
              Назва
            </label>
            <input id="title" type="text" {...register('title')} className={inputClassName} />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="author" className="mb-1 block text-sm font-medium">
              Автор
            </label>
            <input id="author" type="text" {...register('author')} className={inputClassName} />
            {errors.author && (
              <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="photo" className="mb-1 block text-sm font-medium">
              Фото (необовʼязково)
            </label>
            <input
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              {...register('photo')}
              className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-gray-700"
            />
            {errors.photo && (
              <p className="mt-1 text-sm text-red-600">{errors.photo.message}</p>
            )}
          </div>

          {formError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Додавання...' : 'Додати книгу'}
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Ваші книги</h2>

        {listError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{listError}</p>
        )}

        {isLoading ? (
          <p className="text-sm text-gray-500">Завантаження...</p>
        ) : books.length === 0 ? (
          <p className="text-sm text-gray-500">У вас ще немає доданих книг.</p>
        ) : (
          <ul className="space-y-3">
            {books.map((book) => {
              const photoSrc = getPhotoUrl(book.photoUrl);

              return (
                <li
                  key={book.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
                    {photoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoSrc} alt={book.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl">📖</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/books/${book.id}`}
                      className="block truncate text-sm font-semibold hover:underline"
                    >
                      {book.title}
                    </Link>
                    <p className="truncate text-sm text-gray-600">{book.author}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(book)}
                    disabled={deletingId === book.id}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === book.id ? 'Видалення...' : 'Видалити'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}