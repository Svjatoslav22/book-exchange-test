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

export default function MyBooksPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listError, setListError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: { title: '', author: '' },
  });

  const selectedPhoto = watch('photo');
  const selectedFileName =
    selectedPhoto && selectedPhoto.length > 0 ? selectedPhoto[0].name : null;

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

  const openAddModal = () => {
    setEditingBook(null);
    setFormError(null);
    reset({ title: '', author: '' });
    setIsFormModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormError(null);
    reset({ title: book.title, author: book.author });
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingBook(null);
    setFormError(null);
    reset({ title: '', author: '' });
  };

  const onSubmit = async (values: BookFormValues) => {
    setFormError(null);

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('author', values.author);

    if (values.photo && values.photo.length > 0) {
      formData.append('photo', values.photo[0]);
    }

    try {
      if (editingBook) {
        await api.put(`/me/books/${editingBook.id}`, formData);
      } else {
        await api.post('/me/books', formData);
      }
      closeFormModal();
      await fetchBooks();
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;

    setIsDeleting(true);
    setListError(null);

    try {
      await api.delete(`/me/books/${bookToDelete.id}`);
      setBooks((current) => current.filter((item) => item.id !== bookToDelete.id));
      setBookToDelete(null);
    } catch (error) {
      setListError(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isAuthLoading || !user) {
    return <p className="text-sm text-slate-500">Завантаження...</p>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Мої книги</h1>
          <p className="mt-1 text-slate-500">
            Управління вашою бібліотекою для обміну
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-burgundy px-5 py-2.5 font-medium text-white shadow-md transition-all hover:bg-burgundy-hover"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Додати книгу
        </button>
      </div>

      {listError && (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {listError}
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[3/4] animate-pulse rounded-xl bg-slate-200/70"
            />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="mb-1 text-lg font-bold text-slate-700">
            У вас ще немає книг
          </h3>
          <p className="mx-auto mb-6 max-w-sm text-slate-500">
            Додайте свою першу книгу, щоб почати обмінюватися з іншими читачами.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-burgundy px-5 py-2.5 font-medium text-white transition-all hover:bg-burgundy-hover"
          >
            Додати першу книгу
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => {
            const photoSrc = getPhotoUrl(book.photoUrl);

            return (
              <div
                key={book.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <Link
                  href={`/books/${book.id}`}
                  className="relative flex aspect-[3/4] items-center justify-center overflow-hidden border-b border-slate-100 bg-slate-100"
                >
                  {photoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoSrc}
                      alt={book.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <svg
                      className="h-12 w-12 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  )}
                  <span className="absolute left-3 top-3 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-sm">
                    Доступна
                  </span>
                </Link>

                <div className="flex flex-grow flex-col p-4">
                  <Link
                    href={`/books/${book.id}`}
                    className="mb-1 line-clamp-2 text-lg font-bold leading-tight text-slate-900 transition-colors hover:text-burgundy"
                  >
                    {book.title}
                  </Link>
                  <p className="mb-4 text-sm text-slate-500">{book.author}</p>

                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(book)}
                      className="flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                    >
                      <svg
                        className="h-4 w-4"
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
                      Редагувати
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookToDelete(book)}
                      title="Видалити"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add / Edit Book */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeFormModal}
          />
          <div className="pointer-events-none flex min-h-screen items-center justify-center px-4 py-8">
            <div className="pointer-events-auto relative flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingBook ? 'Редагувати книгу' : 'Додати книгу'}
                </h3>
                <button
                  type="button"
                  onClick={closeFormModal}
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

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
                  <div>
                    <label
                      htmlFor="photo"
                      className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 transition-colors hover:bg-slate-100"
                    >
                      <svg
                        className="mb-2 h-10 w-10 text-slate-400 transition-colors group-hover:text-burgundy"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-slate-600">
                        {selectedFileName ||
                          (editingBook
                            ? 'Завантажити нову обкладинку (необовʼязково)'
                            : 'Завантажити обкладинку')}
                      </span>
                      <span className="mt-1 text-xs text-slate-400">
                        PNG, JPG, WebP до 5MB
                      </span>
                      <input
                        id="photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        {...register('photo')}
                        className="hidden"
                      />
                    </label>
                    {errors.photo && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {errors.photo.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="title"
                      className="mb-1 block text-sm font-medium text-slate-700"
                    >
                      Назва книги
                    </label>
                    <input
                      id="title"
                      type="text"
                      placeholder="Тіні забутих предків"
                      {...register('title')}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-burgundy focus:ring-2 focus:ring-burgundy/20"
                    />
                    {errors.title && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="author"
                      className="mb-1 block text-sm font-medium text-slate-700"
                    >
                      Автор
                    </label>
                    <input
                      id="author"
                      type="text"
                      placeholder="Михайло Коцюбинський"
                      {...register('author')}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-burgundy focus:ring-2 focus:ring-burgundy/20"
                    />
                    {errors.author && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {errors.author.message}
                      </p>
                    )}
                  </div>

                  {formError && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                      {formError}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50/50 p-6">
                  <button
                    type="button"
                    onClick={closeFormModal}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-burgundy px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-burgundy-hover disabled:opacity-50"
                  >
                    {isSubmitting ? 'Збереження...' : 'Зберегти'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {bookToDelete && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !isDeleting && setBookToDelete(null)}
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
                Книгу «{bookToDelete.title}» буде назавжди видалено з вашої бібліотеки.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setBookToDelete(null)}
                  className="flex-1 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200 disabled:opacity-50"
                >
                  Скасувати
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
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